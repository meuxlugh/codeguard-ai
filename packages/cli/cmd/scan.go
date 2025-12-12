package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/codeguard-ai/cli/internal/api"
	"github.com/codeguard-ai/cli/internal/config"
	"github.com/codeguard-ai/cli/internal/scanner"
	"github.com/codeguard-ai/cli/internal/ui"
	"github.com/spf13/cobra"
)

var (
	outputFormat string
	showAll      bool
)

var scanCmd = &cobra.Command{
	Use:   "scan [path]",
	Short: "Scan a directory for security issues",
	Long: `Scan analyzes your source code for security vulnerabilities,
best practice violations, and potential bugs.

Examples:
  codeguard scan              # Scan current directory
  codeguard scan ./src        # Scan specific directory
  codeguard scan --format json    # Output as JSON`,
	Args: cobra.MaximumNArgs(1),
	RunE: runScan,
}

func init() {
	rootCmd.AddCommand(scanCmd)
	scanCmd.Flags().StringVarP(&outputFormat, "format", "f", "pretty", "Output format: pretty, json, sarif")
	scanCmd.Flags().BoolVarP(&showAll, "all", "a", false, "Show all issues including low severity")
}

func runScan(cmd *cobra.Command, args []string) error {
	// Determine path to scan
	scanPath := "."
	if len(args) > 0 {
		scanPath = args[0]
	}

	// Resolve absolute path
	absPath, err := filepath.Abs(scanPath)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	// Verify path exists
	info, err := os.Stat(absPath)
	if err != nil {
		return fmt.Errorf("path not found: %w", err)
	}
	if !info.IsDir() {
		return fmt.Errorf("path must be a directory")
	}

	// Load config
	cfg, err := config.Load()
	if err != nil {
		ui.Warning("Could not load config: " + err.Error())
		cfg = &config.Config{APIURL: config.DefaultAPIURL}
	}

	// Check authentication
	if !cfg.IsAuthenticated() {
		ui.Error("Authentication required")
		fmt.Println()
		ui.Info("Run 'codeguard auth login' to authenticate with your API key")
		ui.Info("Get an API key from: https://security-guard-ai.vercel.app/app/settings")
		return nil
	}

	fmt.Println(ui.Logo())

	// Verify API key and get workspace info
	client := api.NewClient(cfg.APIURL, cfg.APIKey)
	fmt.Printf("%s⠋%s Verifying authentication...\r", ui.Cyan, ui.Reset)
	meResp, err := client.GetMe()
	if err != nil {
		fmt.Print(strings.Repeat(" ", 40) + "\r")
		ui.Error("Authentication failed: " + err.Error())
		fmt.Println()
		ui.Info("Run 'codeguard auth login' to re-authenticate")
		return nil
	}
	fmt.Print(strings.Repeat(" ", 40) + "\r")

	ui.Info(fmt.Sprintf("Scanning %s%s%s", ui.Bold, absPath, ui.Reset))
	fmt.Printf("  %sUser: %s%s\n", ui.Dim, meResp.User.Email, ui.Reset)
	fmt.Println()

	// Start scanning files
	startTime := time.Now()

	fmt.Printf("%s⠋%s Collecting source files...\r", ui.Cyan, ui.Reset)
	s := scanner.NewScanner(absPath)
	result, err := s.Scan()
	if err != nil {
		return fmt.Errorf("scan failed: %w", err)
	}

	if len(result.Files) == 0 {
		ui.Warning("No source files found to scan")
		return nil
	}

	fmt.Printf("%s✓%s Found %d files to analyze\n", ui.BrightGreen, ui.Reset, len(result.Files))

	if result.SkippedFiles > 0 {
		ui.Warning(fmt.Sprintf("Skipped %d files (too large)", result.SkippedFiles))
	}

	// Use the already-created client from authentication check
	_ = meResp // meResp was used for displaying user info above

	// Status callback for animated progress
	var frameIdx int

	fmt.Printf("%s%s%s Running AI security analysis...%s", ui.Cyan, ui.SpinnerFrames[0], ui.Reset, strings.Repeat(" ", 20))

	onStatus := func(status string) {
		frame := ui.SpinnerFrames[frameIdx%len(ui.SpinnerFrames)]
		frameIdx++

		statusText := "Initializing..."
		switch status {
		case "pending":
			statusText = "Queued for analysis..."
		case "analyzing":
			statusText = "AI analyzing code..."
		case "completed":
			statusText = "Analysis complete"
		case "error":
			statusText = "Analysis failed"
		}
		fmt.Printf("\r%s%s%s %s%s", ui.Cyan, frame, ui.Reset, statusText, strings.Repeat(" ", 20))
	}

	scanResp, err := client.Scan(result.Files, onStatus)
	if err != nil {
		fmt.Println() // Clear the spinner line
		ui.Error("Analysis failed: " + err.Error())
		return nil
	}

	elapsed := time.Since(startTime)
	fmt.Printf("\r%s✓%s Analysis complete in %.1fs%s\n\n", ui.BrightGreen, ui.Reset, elapsed.Seconds(), strings.Repeat(" ", 20))

	// Display results
	switch outputFormat {
	case "json":
		return outputJSON(scanResp)
	case "sarif":
		return outputSARIF(scanResp, absPath)
	default:
		return outputPretty(scanResp, absPath, showAll)
	}
}

func outputPretty(resp *api.ScanResponse, path string, showAll bool) error {
	// Summary box
	grade := ui.GradeBadge(resp.Grade)

	// Count by severity
	counts := map[string]int{
		"critical": 0,
		"high":     0,
		"medium":   0,
		"low":      0,
	}
	for _, issue := range resp.Issues {
		counts[issue.Severity]++
	}

	summaryLines := []string{
		fmt.Sprintf("Grade: %s", grade),
		fmt.Sprintf("Files scanned: %d", resp.FilesScanned),
		"",
		fmt.Sprintf("%sCritical:%s %d", ui.BrightRed, ui.Reset, counts["critical"]),
		fmt.Sprintf("%sHigh:%s     %d", ui.Red, ui.Reset, counts["high"]),
		fmt.Sprintf("%sMedium:%s   %d", ui.Yellow, ui.Reset, counts["medium"]),
		fmt.Sprintf("%sLow:%s      %d", ui.Green, ui.Reset, counts["low"]),
	}

	fmt.Print(ui.Box("Security Report", strings.Join(summaryLines, "\n")))
	fmt.Println()

	if len(resp.Issues) == 0 {
		ui.Success("No security issues found!")
		return nil
	}

	// Filter issues
	issues := resp.Issues
	if !showAll {
		filtered := make([]api.Issue, 0)
		for _, issue := range issues {
			if issue.Severity != "low" {
				filtered = append(filtered, issue)
			}
		}
		issues = filtered
		if len(issues) < len(resp.Issues) {
			ui.Info(fmt.Sprintf("Showing %d issues (use --all to see %d low severity issues)", len(issues), len(resp.Issues)-len(issues)))
			fmt.Println()
		}
	}

	// Sort by severity
	severityOrder := map[string]int{"critical": 0, "high": 1, "medium": 2, "low": 3}
	sort.Slice(issues, func(i, j int) bool {
		return severityOrder[issues[i].Severity] < severityOrder[issues[j].Severity]
	})

	// Group by file
	byFile := make(map[string][]api.Issue)
	for _, issue := range issues {
		byFile[issue.FilePath] = append(byFile[issue.FilePath], issue)
	}

	// Print issues
	for file, fileIssues := range byFile {
		fmt.Printf("%s%s%s\n", ui.Bold, file, ui.Reset)
		fmt.Println(strings.Repeat("─", 60))

		for _, issue := range fileIssues {
			badge := ui.SeverityBadge(issue.Severity)
			location := ""
			if issue.LineStart > 0 {
				if issue.LineEnd > issue.LineStart {
					location = fmt.Sprintf(" (L%d-%d)", issue.LineStart, issue.LineEnd)
				} else {
					location = fmt.Sprintf(" (L%d)", issue.LineStart)
				}
			}

			fmt.Printf("  %s %s%s%s%s\n", badge, ui.Bold, issue.Title, ui.Reset, location)
			if issue.Description != "" {
				// Wrap description
				desc := wrapText(issue.Description, 56)
				for _, line := range strings.Split(desc, "\n") {
					fmt.Printf("      %s%s%s\n", ui.Dim, line, ui.Reset)
				}
			}
			if issue.Suggestion != "" {
				fmt.Printf("      %s→ %s%s\n", ui.Cyan, issue.Suggestion, ui.Reset)
			}
			fmt.Println()
		}
	}

	return nil
}

func outputJSON(resp *api.ScanResponse) error {
	// Simple JSON output for CI/CD integration
	fmt.Println("{")
	fmt.Printf("  \"grade\": \"%s\",\n", resp.Grade)
	fmt.Printf("  \"filesScanned\": %d,\n", resp.FilesScanned)
	fmt.Printf("  \"issueCount\": %d,\n", len(resp.Issues))
	fmt.Println("  \"issues\": [")

	for i, issue := range resp.Issues {
		fmt.Println("    {")
		fmt.Printf("      \"severity\": \"%s\",\n", issue.Severity)
		fmt.Printf("      \"title\": \"%s\",\n", escapeJSON(issue.Title))
		fmt.Printf("      \"file\": \"%s\",\n", issue.FilePath)
		fmt.Printf("      \"line\": %d,\n", issue.LineStart)
		fmt.Printf("      \"description\": \"%s\"\n", escapeJSON(issue.Description))
		if i < len(resp.Issues)-1 {
			fmt.Println("    },")
		} else {
			fmt.Println("    }")
		}
	}

	fmt.Println("  ]")
	fmt.Println("}")
	return nil
}

func outputSARIF(resp *api.ScanResponse, basePath string) error {
	// SARIF 2.1.0 format for GitHub Code Scanning
	// https://docs.oasis-open.org/sarif/sarif/v2.1.0/sarif-v2.1.0.html

	// Map severity to SARIF level
	severityToLevel := map[string]string{
		"critical": "error",
		"high":     "error",
		"medium":   "warning",
		"low":      "note",
	}

	// Build rules array (unique rules)
	ruleMap := make(map[string]api.Issue)
	for _, issue := range resp.Issues {
		ruleID := fmt.Sprintf("%v", issue.ID)
		if _, exists := ruleMap[ruleID]; !exists {
			ruleMap[ruleID] = issue
		}
	}

	fmt.Println("{")
	fmt.Println("  \"$schema\": \"https://json.schemastore.org/sarif-2.1.0.json\",")
	fmt.Println("  \"version\": \"2.1.0\",")
	fmt.Println("  \"runs\": [{")
	fmt.Println("    \"tool\": {")
	fmt.Println("      \"driver\": {")
	fmt.Println("        \"name\": \"CodeGuard AI\",")
	fmt.Println("        \"version\": \"1.0.0\",")
	fmt.Println("        \"informationUri\": \"https://security-guard-ai.vercel.app\",")
	fmt.Println("        \"rules\": [")

	// Output rules
	ruleIdx := 0
	ruleCount := len(ruleMap)
	for ruleID, issue := range ruleMap {
		fmt.Println("          {")
		fmt.Printf("            \"id\": \"%s\",\n", escapeJSON(ruleID))
		fmt.Printf("            \"name\": \"%s\",\n", escapeJSON(issue.Title))
		fmt.Println("            \"shortDescription\": {")
		fmt.Printf("              \"text\": \"%s\"\n", escapeJSON(issue.Title))
		fmt.Println("            },")
		fmt.Println("            \"fullDescription\": {")
		fmt.Printf("              \"text\": \"%s\"\n", escapeJSON(issue.Description))
		fmt.Println("            },")
		fmt.Println("            \"defaultConfiguration\": {")
		fmt.Printf("              \"level\": \"%s\"\n", severityToLevel[issue.Severity])
		fmt.Println("            },")
		fmt.Println("            \"properties\": {")
		fmt.Printf("              \"security-severity\": \"%s\",\n", severityToScore(issue.Severity))
		fmt.Printf("              \"category\": \"%s\"\n", escapeJSON(issue.Category))
		fmt.Println("            }")
		ruleIdx++
		if ruleIdx < ruleCount {
			fmt.Println("          },")
		} else {
			fmt.Println("          }")
		}
	}

	fmt.Println("        ]")
	fmt.Println("      }")
	fmt.Println("    },")

	// Output results
	fmt.Println("    \"results\": [")
	for i, issue := range resp.Issues {
		ruleID := fmt.Sprintf("%v", issue.ID)
		level := severityToLevel[issue.Severity]

		fmt.Println("      {")
		fmt.Printf("        \"ruleId\": \"%s\",\n", escapeJSON(ruleID))
		fmt.Printf("        \"level\": \"%s\",\n", level)
		fmt.Println("        \"message\": {")
		fmt.Printf("          \"text\": \"%s\"\n", escapeJSON(issue.Description))
		fmt.Println("        },")
		fmt.Println("        \"locations\": [{")
		fmt.Println("          \"physicalLocation\": {")
		fmt.Println("            \"artifactLocation\": {")
		fmt.Printf("              \"uri\": \"%s\"\n", escapeJSON(issue.FilePath))
		fmt.Println("            },")
		fmt.Println("            \"region\": {")
		fmt.Printf("              \"startLine\": %d,\n", maxInt(issue.LineStart, 1))
		fmt.Printf("              \"endLine\": %d\n", maxInt(issue.LineEnd, issue.LineStart, 1))
		fmt.Println("            }")
		fmt.Println("          }")
		fmt.Println("        }]")

		if i < len(resp.Issues)-1 {
			fmt.Println("      },")
		} else {
			fmt.Println("      }")
		}
	}

	fmt.Println("    ]")
	fmt.Println("  }]")
	fmt.Println("}")

	return nil
}

// severityToScore converts severity to CVSS-like score for GitHub
func severityToScore(severity string) string {
	switch severity {
	case "critical":
		return "9.0"
	case "high":
		return "7.0"
	case "medium":
		return "4.0"
	case "low":
		return "1.0"
	default:
		return "0.0"
	}
}

// maxInt returns the maximum of the given integers
func maxInt(values ...int) int {
	max := values[0]
	for _, v := range values[1:] {
		if v > max {
			max = v
		}
	}
	return max
}

func escapeJSON(s string) string {
	s = strings.ReplaceAll(s, "\\", "\\\\")
	s = strings.ReplaceAll(s, "\"", "\\\"")
	s = strings.ReplaceAll(s, "\n", "\\n")
	s = strings.ReplaceAll(s, "\t", "\\t")
	return s
}

func wrapText(text string, width int) string {
	words := strings.Fields(text)
	if len(words) == 0 {
		return ""
	}

	var lines []string
	var currentLine strings.Builder

	for _, word := range words {
		if currentLine.Len() > 0 && currentLine.Len()+1+len(word) > width {
			lines = append(lines, currentLine.String())
			currentLine.Reset()
		}
		if currentLine.Len() > 0 {
			currentLine.WriteString(" ")
		}
		currentLine.WriteString(word)
	}

	if currentLine.Len() > 0 {
		lines = append(lines, currentLine.String())
	}

	return strings.Join(lines, "\n")
}
