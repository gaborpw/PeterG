// Package deliver sends a finished briefing to Peter.
package deliver

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"mime"
	"net/http"
	"strings"
	"time"

	"google.golang.org/api/gmail/v1"
)

// Email sends the briefing to Peter's own address using the same Gmail account
// it was generated from. Sending through Gmail rather than an SMTP relay means
// there is no second service to configure and no deliverability to manage — the
// mail is already coming from the account it is addressed to.
func Email(ctx context.Context, svc *gmail.Service, to, body string) error {
	subject := fmt.Sprintf("Morning briefing — %s", time.Now().Format("Mon Jan 2"))

	var msg bytes.Buffer
	fmt.Fprintf(&msg, "To: %s\r\n", to)
	// Encode the subject so a non-ASCII character (an em dash, an emoji in a
	// forwarded subject line) doesn't corrupt the header.
	fmt.Fprintf(&msg, "Subject: %s\r\n", mime.QEncoding.Encode("utf-8", subject))
	msg.WriteString("MIME-Version: 1.0\r\n")
	msg.WriteString("Content-Type: text/plain; charset=\"utf-8\"\r\n\r\n")
	msg.WriteString(body)

	// Gmail requires URL-safe base64 without padding for raw messages.
	raw := base64.URLEncoding.EncodeToString(msg.Bytes())
	_, err := svc.Users.Messages.Send("me", &gmail.Message{Raw: raw}).Context(ctx).Do()
	if err != nil {
		return fmt.Errorf("send briefing email: %w", err)
	}
	return nil
}

// Push sends a phone notification via ntfy.sh. The topic name is the only
// secret involved — anyone who knows it can publish to it — so treat it like a
// password and make it long and random.
//
// Push is best-effort by design: the email is the durable copy, and a failed
// notification should never fail the run.
func Push(ctx context.Context, topic, body string) error {
	if topic == "" {
		return nil
	}

	// Phone notifications truncate; send the headline and let the email carry
	// the rest rather than shipping a wall of text to the lock screen.
	summary := headline(body, 400)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost,
		"https://ntfy.sh/"+topic, strings.NewReader(summary))
	if err != nil {
		return fmt.Errorf("build push request: %w", err)
	}
	req.Header.Set("Title", "Morning briefing")
	req.Header.Set("Tags", "mailbox")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("send push: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 300 {
		return fmt.Errorf("push rejected: %s", resp.Status)
	}
	return nil
}

// headline extracts the opening of the briefing, stopping at the character
// budget or the end of the first section, whichever comes first.
func headline(body string, limit int) string {
	var kept []string
	used := 0
	for _, line := range strings.Split(body, "\n") {
		trimmed := strings.TrimSpace(line)
		if trimmed == "" {
			continue
		}
		if used+len(trimmed) > limit {
			break
		}
		kept = append(kept, trimmed)
		used += len(trimmed)
	}
	if len(kept) == 0 {
		return "Briefing ready — see email."
	}
	return strings.Join(kept, "\n")
}
