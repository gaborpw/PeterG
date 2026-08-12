// Package mail reads recent messages from Gmail.
package mail

import (
	"context"
	"fmt"
	"strings"
	"time"

	"golang.org/x/oauth2"
	"google.golang.org/api/gmail/v1"
	"google.golang.org/api/option"
)

// Message is the slice of an email the briefing actually needs. Bodies are
// deliberately excluded: subject, sender and snippet are enough to classify
// almost everything, and full bodies would multiply the token cost by an order
// of magnitude for no gain in accuracy.
type Message struct {
	ID      string
	From    string
	Subject string
	Date    time.Time
	Snippet string
	Labels  []string
}

// Spam reports whether Gmail filed this message as spam. Spam is scanned on
// purpose — legitimate mail lands there more often than people expect — but the
// briefing flags it so a bank alert in spam reads differently from one in the
// inbox.
func (m Message) Spam() bool {
	for _, l := range m.Labels {
		if l == "SPAM" {
			return true
		}
	}
	return false
}

// Client reads a single Gmail account.
type Client struct {
	svc  *gmail.Service
	addr string
}

// Config holds the OAuth credentials for one Gmail account. The refresh token
// is long-lived; access tokens are minted from it on each run.
type Config struct {
	ClientID     string
	ClientSecret string
	RefreshToken string
	Address      string
}

// New builds a Gmail client from a stored refresh token. No browser flow and no
// local token cache, so it runs unattended in CI.
func New(ctx context.Context, cfg Config) (*Client, error) {
	oauthCfg := &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://accounts.google.com/o/oauth2/auth",
			TokenURL: "https://oauth2.googleapis.com/token",
		},
		Scopes: []string{gmail.GmailReadonlyScope, gmail.GmailSendScope},
	}

	src := oauthCfg.TokenSource(ctx, &oauth2.Token{RefreshToken: cfg.RefreshToken})
	svc, err := gmail.NewService(ctx, option.WithTokenSource(src))
	if err != nil {
		return nil, fmt.Errorf("gmail service: %w", err)
	}
	return &Client{svc: svc, addr: cfg.Address}, nil
}

// Recent returns messages received in the last 24 hours, spam and trash
// included. Sent mail and drafts are excluded — they are things Peter wrote,
// not things that arrived.
func (c *Client) Recent(ctx context.Context) ([]Message, error) {
	const query = "newer_than:1d in:anywhere -in:sent -in:draft"

	var ids []string
	call := c.svc.Users.Messages.List("me").Q(query).MaxResults(200)
	for {
		page, err := call.Context(ctx).Do()
		if err != nil {
			return nil, fmt.Errorf("list messages: %w", err)
		}
		for _, m := range page.Messages {
			ids = append(ids, m.Id)
		}
		// A single page is not the full day — personal volume runs ~100
		// threads in 24 hours, so paging is load-bearing, not defensive.
		if page.NextPageToken == "" {
			break
		}
		call = c.svc.Users.Messages.List("me").Q(query).MaxResults(200).PageToken(page.NextPageToken)
	}

	msgs := make([]Message, 0, len(ids))
	for _, id := range ids {
		// Metadata format returns headers and the snippet without the body,
		// which is all the classifier reads.
		full, err := c.svc.Users.Messages.Get("me", id).
			Format("metadata").
			MetadataHeaders("From", "Subject", "Date").
			Context(ctx).Do()
		if err != nil {
			return nil, fmt.Errorf("get message %s: %w", id, err)
		}
		msgs = append(msgs, convert(full))
	}
	return msgs, nil
}

func convert(m *gmail.Message) Message {
	out := Message{
		ID:      m.Id,
		Snippet: strings.TrimSpace(m.Snippet),
		Labels:  m.LabelIds,
		// InternalDate is Unix milliseconds and is set by Gmail on receipt,
		// which makes it more reliable than the sender-controlled Date header.
		Date: time.UnixMilli(m.InternalDate),
	}
	if m.Payload == nil {
		return out
	}
	for _, h := range m.Payload.Headers {
		switch h.Name {
		case "From":
			out.From = h.Value
		case "Subject":
			out.Subject = h.Value
		}
	}
	return out
}

// Address returns the mailbox this client reads.
func (c *Client) Address() string { return c.addr }

// Service exposes the underlying Gmail service so the briefing can be mailed
// back through the same authenticated account it was built from.
func (c *Client) Service() *gmail.Service { return c.svc }
