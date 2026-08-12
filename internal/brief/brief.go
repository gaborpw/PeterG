// Package brief turns a day of email into a short written briefing.
package brief

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/anthropics/anthropic-sdk-go"
	"github.com/anthropics/anthropic-sdk-go/option"

	"github.com/gaborpw/PeterG/internal/mail"
)

// Model is the Claude model that classifies and writes the briefing. Judging
// what matters in an inbox is the part of this program that cannot be written
// as rules in code, which is why it is the one place an LLM earns its keep.
const Model = "claude-opus-5"

// Writer produces briefings from a set of messages plus a rules document.
type Writer struct {
	client anthropic.Client
	rules  string
}

// New builds a Writer. The rules argument is the full text of email-rules.md;
// it is passed on every run so edits take effect the next morning without a
// redeploy.
func New(apiKey, rules string) *Writer {
	return &Writer{
		client: anthropic.NewClient(option.WithAPIKey(apiKey)),
		rules:  rules,
	}
}

const systemPrompt = `You write a daily email briefing for one person, Peter.

You are given the rules that define what counts as important, followed by every
message that arrived in the last 24 hours. Apply the rules and write the
briefing.

Follow the rules document exactly — it is maintained by Peter and is the
authority on what to report and what to suppress. It changes over time; never
substitute your own judgment for a rule it states.

Write the briefing itself and nothing else. No preamble, no explanation of your
reasoning, no meta-commentary about the rules or the task.

Formatting: Markdown, readable on a phone. Group by category and drop any
category with nothing in it. One line per item saying who, what, and what it
needs from him. Always carry concrete specifics through — dollar amounts, dates,
times, ticket numbers. A briefing that says "a bill arrived" instead of "$140.60
to UH Hospitals, paid" has failed at its job.

End with a single line counting what was scanned and what was filtered out.

If nothing important arrived, say exactly that in one sentence. Do not pad a
quiet day into a long report.`

// Write classifies the messages and returns the briefing as Markdown.
func (w *Writer) Write(ctx context.Context, msgs []mail.Message) (string, error) {
	if len(msgs) == 0 {
		return "No mail arrived in the last 24 hours.", nil
	}

	prompt := fmt.Sprintf("# Rules\n\n%s\n\n# Messages (%d in the last 24 hours)\n\n%s",
		w.rules, len(msgs), format(msgs))

	adaptive := anthropic.ThinkingConfigAdaptiveParam{}
	resp, err := w.client.Messages.New(ctx, anthropic.MessageNewParams{
		Model:     Model,
		MaxTokens: 8000,
		Thinking:  anthropic.ThinkingConfigParamUnion{OfAdaptive: &adaptive},
		System: []anthropic.TextBlockParam{{
			Text: systemPrompt,
			// The system prompt is byte-identical across runs, so caching it
			// costs one write and is served at cache-read rates thereafter.
			CacheControl: anthropic.NewCacheControlEphemeralParam(),
		}},
		Messages: []anthropic.MessageParam{
			anthropic.NewUserMessage(anthropic.NewTextBlock(prompt)),
		},
	})
	if err != nil {
		return "", fmt.Errorf("claude: %w", err)
	}

	// A safety classifier can decline a request with a normal 200 response and
	// an empty content array, so check before reading blocks.
	if resp.StopReason == anthropic.StopReasonRefusal {
		return "", fmt.Errorf("claude declined the request: %s", resp.StopDetails.Explanation)
	}

	var out strings.Builder
	for _, block := range resp.Content {
		if text, ok := block.AsAny().(anthropic.TextBlock); ok {
			out.WriteString(text.Text)
		}
	}
	if out.Len() == 0 {
		return "", fmt.Errorf("claude returned no text (stop reason: %s)", resp.StopReason)
	}
	return strings.TrimSpace(out.String()), nil
}

// format renders messages compactly. Field labels are spelled out rather than
// packed into a CSV row so a truncated or reordered line stays unambiguous.
func format(msgs []mail.Message) string {
	var b strings.Builder
	for i, m := range msgs {
		fmt.Fprintf(&b, "%d. From: %s\n   Subject: %s\n   Received: %s\n",
			i+1, m.From, m.Subject, m.Date.Format(time.RFC1123))
		if m.Spam() {
			b.WriteString("   Folder: SPAM\n")
		}
		if m.Snippet != "" {
			fmt.Fprintf(&b, "   Preview: %s\n", truncate(m.Snippet, 300))
		}
		b.WriteString("\n")
	}
	return b.String()
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}
