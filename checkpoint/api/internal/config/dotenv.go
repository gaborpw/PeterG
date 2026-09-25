package config

import (
	"bufio"
	"os"
	"path/filepath"
	"strings"
)

// loadDotEnv reads KEY=VALUE lines from a .env file into the process
// environment, without overwriting anything already set — an explicit
// `DATABASE_URL=... go run` must still win over the file.
//
// Deliberately hand-rolled rather than pulling in a library: it is thirty lines,
// it runs before anything else in the process, and a dependency here would be a
// dependency in the path of every startup.
//
// Missing file is not an error. Production sets real environment variables and
// has no .env at all.
func loadDotEnv(paths ...string) {
	for _, p := range paths {
		f, err := os.Open(filepath.Clean(p))
		if err != nil {
			continue
		}
		applyEnvLines(f)
		_ = f.Close()
		return
	}
}

func applyEnvLines(f *os.File) {
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		key, value, found := strings.Cut(line, "=")
		if !found {
			continue
		}

		key = strings.TrimSpace(strings.TrimPrefix(key, "export "))
		value = strings.TrimSpace(value)

		// Strip one layer of matching quotes, so a URL with a # in it survives.
		if len(value) >= 2 {
			first, last := value[0], value[len(value)-1]
			if (first == '"' && last == '"') || (first == '\'' && last == '\'') {
				value = value[1 : len(value)-1]
			}
		}

		if key == "" {
			continue
		}
		// Already set to something in the real environment: leave it alone.
		// An empty value counts as unset, matching envOr in config.go — a
		// variable exported as "" should not shadow the file.
		if existing, exists := os.LookupEnv(key); exists && existing != "" {
			continue
		}
		_ = os.Setenv(key, value)
	}
}
