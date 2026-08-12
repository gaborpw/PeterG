// Command briefing scans the last 24 hours of Gmail and delivers a summary of
// what matters. It is designed to run unattended on a schedule.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gaborpw/PeterG/internal/brief"
	"github.com/gaborpw/PeterG/internal/deliver"
	"github.com/gaborpw/PeterG/internal/mail"
)

func main() {
	dryRun := flag.Bool("dry-run", false, "print the briefing instead of sending it")
	rulesPath := flag.String("rules", "email-rules.md", "path to the classification rules")
	flag.Parse()

	if err := run(*dryRun, *rulesPath); err != nil {
		log.Fatalf("briefing failed: %v", err)
	}
}

func run(dryRun bool, rulesPath string) error {
	// A single generous deadline for the whole run. Gmail paging plus one
	// Claude call comfortably fits; anything longer means something is wedged.
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	cfg, err := loadConfig()
	if err != nil {
		return err
	}

	rules, err := os.ReadFile(rulesPath)
	if err != nil {
		return fmt.Errorf("read rules: %w", err)
	}

	client, err := mail.New(ctx, cfg.gmail)
	if err != nil {
		return err
	}

	log.Printf("scanning %s for the last 24 hours", client.Address())
	msgs, err := client.Recent(ctx)
	if err != nil {
		return err
	}
	log.Printf("found %d messages", len(msgs))

	briefing, err := brief.New(cfg.anthropicKey, string(rules)).Write(ctx, msgs)
	if err != nil {
		return err
	}

	if dryRun {
		fmt.Println(briefing)
		return nil
	}

	if err := deliver.Email(ctx, client.Service(), client.Address(), briefing); err != nil {
		return err
	}
	log.Printf("emailed briefing to %s", client.Address())

	// Push is a convenience on top of the email, which is the durable copy —
	// a notification failure is logged but does not fail the run.
	if err := deliver.Push(ctx, cfg.ntfyTopic, briefing); err != nil {
		log.Printf("push notification failed: %v", err)
	} else if cfg.ntfyTopic != "" {
		log.Print("sent push notification")
	}

	return nil
}

type config struct {
	gmail        mail.Config
	anthropicKey string
	ntfyTopic    string
}

func loadConfig() (config, error) {
	cfg := config{
		gmail: mail.Config{
			ClientID:     os.Getenv("GMAIL_CLIENT_ID"),
			ClientSecret: os.Getenv("GMAIL_CLIENT_SECRET"),
			RefreshToken: os.Getenv("GMAIL_REFRESH_TOKEN"),
			Address:      os.Getenv("GMAIL_ADDRESS"),
		},
		anthropicKey: os.Getenv("ANTHROPIC_API_KEY"),
		ntfyTopic:    os.Getenv("NTFY_TOPIC"), // optional
	}

	// Report every missing variable at once. Discovering them one failed run
	// at a time is miserable when each run is a CI round trip.
	required := map[string]string{
		"GMAIL_CLIENT_ID":     cfg.gmail.ClientID,
		"GMAIL_CLIENT_SECRET": cfg.gmail.ClientSecret,
		"GMAIL_REFRESH_TOKEN": cfg.gmail.RefreshToken,
		"GMAIL_ADDRESS":       cfg.gmail.Address,
		"ANTHROPIC_API_KEY":   cfg.anthropicKey,
	}
	var missing []string
	for name, value := range required {
		if value == "" {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		return config{}, fmt.Errorf("missing required environment variables: %v", missing)
	}
	return cfg, nil
}
