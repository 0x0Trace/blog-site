#!/usr/bin/env python3
"""
Blog site management script.

Commands:
    sync-sidebar   Update sidebar HTML in all pages from sidebar.json
    new-machine    Scaffold a new HackSmarter walkthrough
"""

import argparse
import json
import os
import re
import sys
from datetime import date
from glob import glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SIDEBAR_JSON = ROOT / "sidebar.json"
TEMPLATE_FILE = ROOT / "templates" / "walkthrough.html"
SEARCH_INDEX = ROOT / "search-index.json"
UPDATES_JSON = ROOT / "updates.json"
SITEMAP_XML = ROOT / "sitemap.xml"

MARKER_START = "<!-- SIDEBAR-START -->"
MARKER_END = "<!-- SIDEBAR-END -->"


# ---------------------------------------------------------------------------
# Sidebar generation
# ---------------------------------------------------------------------------

def load_sidebar():
    with open(SIDEBAR_JSON, "r", encoding="utf-8") as f:
        return json.load(f)


def build_sidebar_html(sidebar_data, prefix, current_url):
    """Generate the sidebar HTML block for a given page.

    Args:
        sidebar_data: parsed sidebar.json
        prefix: relative path prefix ('' for root, '../' for subdirectories)
        current_url: URL of the current page relative to root (e.g. 'HackSmarter/404bank.html')
    """
    indent = "    "
    lines = []

    lines.append(f'{MARKER_START}')
    lines.append(f'<aside class="sidebar" id="sidebar" aria-label="Main navigation">')
    lines.append(f'{indent}<div class="sidebar-header">')
    lines.append(f'{indent}{indent}<h3>Navigate</h3>')
    lines.append(f'{indent}{indent}<button id="sidebarClose" class="sidebar-close" aria-label="Close navigation"><span aria-hidden="true">\u00d7</span></button>')
    lines.append(f'{indent}</div>')
    lines.append(f'{indent}<div class="sidebar-content">')
    lines.append(f'{indent}{indent}<ul class="sidebar-nav">')

    for item in sidebar_data["items"]:
        if "children" in item:
            # Submenu
            children = item["children"]
            expanded = item.get("expanded", False)
            # Check if any child is the current page
            child_is_current = any(c["url"] == current_url for c in children)
            # If a child is current, expand the submenu
            is_expanded = expanded or child_is_current

            aria_exp = "true" if is_expanded else "false"
            hidden_attr = "" if is_expanded else " hidden"

            lines.append(f'{indent}{indent}{indent}<li class="has-submenu">')
            lines.append(f'{indent}{indent}{indent}{indent}<button class="submenu-toggle" aria-expanded="{aria_exp}"><span class="arrow" aria-hidden="true"></span>{item["label"]}</button>')
            lines.append(f'{indent}{indent}{indent}{indent}<ul class="submenu"{hidden_attr}>')
            for child in children:
                href = prefix + child["url"]
                if child["url"] == current_url:
                    lines.append(f'{indent}{indent}{indent}{indent}{indent}<li><a href="{href}" aria-current="page">{child["label"]}</a></li>')
                else:
                    lines.append(f'{indent}{indent}{indent}{indent}{indent}<li><a href="{href}">{child["label"]}</a></li>')
            lines.append(f'{indent}{indent}{indent}{indent}</ul>')
            lines.append(f'{indent}{indent}{indent}</li>')
        else:
            # Simple link
            href = prefix + item["url"]
            if item["url"] == current_url:
                lines.append(f'{indent}{indent}{indent}<li><a href="{href}" aria-current="page">{item["label"]}</a></li>')
            else:
                lines.append(f'{indent}{indent}{indent}<li><a href="{href}">{item["label"]}</a></li>')

    lines.append(f'{indent}{indent}</ul>')
    lines.append(f'{indent}</div>')
    lines.append(f'</aside>')
    lines.append(f'<div class="sidebar-backdrop" id="sidebarBackdrop" aria-hidden="true"></div>')
    lines.append(f'{MARKER_END}')

    return "\n".join(lines)


def get_prefix_and_url(filepath):
    """Determine the relative prefix and current URL for a file."""
    rel = filepath.relative_to(ROOT)
    parts = rel.parts
    current_url = str(rel).replace(os.sep, "/")

    if len(parts) == 1:
        # Root-level file
        return "", current_url
    else:
        # Subdirectory file
        return "../", current_url


def find_html_files():
    """Find all HTML files that should have sidebars."""
    patterns = [
        ROOT / "*.html",
        ROOT / "HackSmarter" / "*.html",
        ROOT / "writeups" / "*.html",
        ROOT / "projects" / "*.html",
    ]
    files = []
    for pattern in patterns:
        files.extend(Path(p) for p in glob(str(pattern)))

    # Exclude files that shouldn't have sidebars
    exclude = {"google10579add47b0162b.html"}
    return sorted(f for f in files if f.name not in exclude)


def sync_sidebar():
    """Read sidebar.json and update all HTML files."""
    sidebar_data = load_sidebar()
    html_files = find_html_files()

    updated = []
    skipped = []

    for filepath in html_files:
        content = filepath.read_text(encoding="utf-8")

        # Check if markers exist
        if MARKER_START not in content:
            skipped.append(filepath)
            continue

        prefix, current_url = get_prefix_and_url(filepath)
        new_sidebar = build_sidebar_html(sidebar_data, prefix, current_url)

        # Replace content between markers (inclusive)
        pattern = re.compile(
            re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END),
            re.DOTALL,
        )
        new_content = pattern.sub(new_sidebar, content)

        if new_content != content:
            filepath.write_text(new_content, encoding="utf-8")
            updated.append(filepath)

    print(f"Synced {len(updated)} file(s):")
    for f in updated:
        print(f"  {f.relative_to(ROOT)}")

    if skipped:
        print(f"\nSkipped {len(skipped)} file(s) (no markers found):")
        for f in skipped:
            print(f"  {f.relative_to(ROOT)}")

    if not updated and not skipped:
        print("All files already up to date.")

    return updated


# ---------------------------------------------------------------------------
# New machine scaffolding
# ---------------------------------------------------------------------------

DIFFICULTY_CLASSES = {
    "easy": "difficulty-easy",
    "medium": "difficulty-medium",
    "hard": "difficulty-hard",
    "medium-hard": "difficulty-hard",
}

DEFAULT_CONTENT = """\
  <h2 id="{slug}">{title}</h2>

  <!-- <img src="../assets/{filename}/logo.png" alt="{title} Machine Logo" class="machine-logo" /> -->

  <div class="machine-info">
    <ul>
      <li><strong>Platform:</strong> <a href="https://www.hacksmarter.org/" target="_blank" rel="noopener">HackSmarter Labs</a></li>
      <li><strong>Difficulty:</strong> <span class="{diff_class}">{difficulty}</span></li>
      <li><strong>Domain:</strong> {domain}</li>
      <li><strong>Key Topics:</strong> {topics}</li>
    </ul>
  </div>

  <h3 id="introduction">Introduction</h3>
  <p>TODO: Write introduction here.</p>

  <h2 id="reconnaissance">Reconnaissance</h2>

  <h3 id="nmap-scan"><span class="step">[Step 1]</span> Nmap Scan</h3>
  <p>TODO: Add nmap scan results.</p>

  <h2 id="initial-access">Initial Access</h2>

  <h3 id="step-2"><span class="step">[Step 2]</span> TODO</h3>
  <p>TODO: Describe initial access.</p>

  <h2 id="privilege-escalation">Privilege Escalation</h2>

  <h3 id="step-3"><span class="step">[Step 3]</span> TODO</h3>
  <p>TODO: Describe privilege escalation.</p>

  <h2 id="lessons-learned">Lessons Learned</h2>
  <p>TODO: Write lessons learned.</p>

  <h2 id="tools-used">Tools Used</h2>
  <ul class="tools-grid">
    <li><strong><a href="https://nmap.org/" target="_blank" rel="noopener">Nmap</a></strong> - Network scanning</li>
  </ul>

  <h2 id="conclusion">Conclusion</h2>
  <p>TODO: Write conclusion.</p>

  <p><em>This walkthrough is for educational purposes only. Always obtain proper authorization before testing security controls.</em></p>
"""


def prompt_input(label, default=None):
    """Prompt user for input with optional default."""
    if default:
        val = input(f"{label} [{default}]: ").strip()
        return val if val else default
    while True:
        val = input(f"{label}: ").strip()
        if val:
            return val
        print("  (required)")


def new_machine(args):
    """Create a new HackSmarter machine walkthrough."""
    # Gather info interactively or from CLI flags
    if args.name:
        title = args.name
    else:
        title = prompt_input("Machine display name (e.g. '404-Bank')")

    if args.filename:
        filename = args.filename
    else:
        default_fn = re.sub(r"[^a-z0-9]", "", title.lower())
        filename = prompt_input("Filename (no extension)", default=default_fn)

    if args.difficulty:
        difficulty = args.difficulty
    else:
        difficulty = prompt_input("Difficulty (Easy/Medium/Hard/Medium-Hard)")

    if args.domain:
        domain = args.domain
    else:
        domain = prompt_input("Domain (e.g. '404finance.local')")

    if args.topics:
        topics = args.topics
    else:
        topics = prompt_input("Key topics (comma-separated)")

    if args.description:
        description = args.description
    else:
        description = prompt_input("Short description (for meta tags)")

    if args.og_image:
        og_image = args.og_image
    else:
        og_image = prompt_input(
            "OG image URL",
            default=f"https://z3rotrace.live/assets/{filename}/logo.png",
        )

    output_path = ROOT / "HackSmarter" / f"{filename}.html"
    if output_path.exists():
        print(f"Error: {output_path.relative_to(ROOT)} already exists!")
        sys.exit(1)

    # 1. Create assets directory
    assets_dir = ROOT / "assets" / filename
    assets_dir.mkdir(parents=True, exist_ok=True)
    print(f"Created assets/{filename}/")

    # 2. Generate HTML from template
    template = TEMPLATE_FILE.read_text(encoding="utf-8")
    slug = re.sub(r"[^a-z0-9-]", "", title.lower().replace(" ", "-"))
    diff_class = DIFFICULTY_CLASSES.get(difficulty.lower(), "difficulty-medium")

    content = DEFAULT_CONTENT.format(
        slug=slug,
        title=title,
        filename=filename,
        diff_class=diff_class,
        difficulty=difficulty,
        domain=domain,
        topics=topics,
    )

    og_title = f"{title} - HackSmarter Labs Walkthrough"
    og_desc = f"Complete walkthrough of {title} from HackSmarter Labs. {description}"

    html = template
    html = html.replace("{{TITLE}}", title)
    html = html.replace("{{DESCRIPTION}}", description)
    html = html.replace("{{OG_TITLE}}", og_title)
    html = html.replace("{{OG_DESCRIPTION}}", og_desc)
    html = html.replace("{{OG_IMAGE}}", og_image)
    html = html.replace("{{FILENAME}}", filename)
    html = html.replace("{{EXTRA_STYLES}}", "")
    html = html.replace("{{CONTENT}}", content)

    output_path.write_text(html, encoding="utf-8")
    print(f"Created HackSmarter/{filename}.html")

    # 3. Add to sidebar.json
    sidebar_data = load_sidebar()
    for item in sidebar_data["items"]:
        if item.get("label") == "HackSmarter Labs":
            item["children"].append({
                "label": title,
                "url": f"HackSmarter/{filename}.html",
            })
            break
    with open(SIDEBAR_JSON, "w", encoding="utf-8") as f:
        json.dump(sidebar_data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("Updated sidebar.json")

    # 4. Add stub to search-index.json
    with open(SEARCH_INDEX, "r", encoding="utf-8") as f:
        search_data = json.load(f)

    search_data.insert(0, {
        "title": title,
        "url": f"HackSmarter/{filename}.html",
        "category": "HackSmarter Labs",
        "difficulty": difficulty,
        "keywords": [kw.strip() for kw in topics.split(",")],
        "sections": [],
    })

    with open(SEARCH_INDEX, "w", encoding="utf-8") as f:
        json.dump(search_data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("Updated search-index.json")

    # 5. Prepend to updates.json
    with open(UPDATES_JSON, "r", encoding="utf-8") as f:
        updates = json.load(f)

    updates.insert(0, {
        "date": date.today().isoformat(),
        "title": f"{title} - {topics}",
        "link": f"HackSmarter/{filename}.html",
    })

    with open(UPDATES_JSON, "w", encoding="utf-8") as f:
        json.dump(updates, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print("Updated updates.json")

    # 6. Add to sitemap.xml
    sitemap_entry = (
        f"\n  <url>\n"
        f"    <loc>https://z3rotrace.live/HackSmarter/{filename}.html</loc>\n"
        f"    <changefreq>monthly</changefreq>\n"
        f"    <priority>0.7</priority>\n"
        f"  </url>"
    )
    sitemap_content = SITEMAP_XML.read_text(encoding="utf-8")
    # Insert before the closing </urlset> but after the last HackSmarter entry
    # Find the last HackSmarter URL block
    last_hs = sitemap_content.rfind("</url>\n\n  <!-- Other Pages -->")
    if last_hs != -1:
        insert_pos = last_hs + len("</url>")
        sitemap_content = (
            sitemap_content[:insert_pos]
            + sitemap_entry
            + sitemap_content[insert_pos:]
        )
    else:
        # Fallback: insert before </urlset>
        sitemap_content = sitemap_content.replace(
            "</urlset>",
            sitemap_entry + "\n</urlset>",
        )
    SITEMAP_XML.write_text(sitemap_content, encoding="utf-8")
    print("Updated sitemap.xml")

    # 7. Sync sidebar across all files
    print("\nSyncing sidebar across all pages...")
    sync_sidebar()

    print(f"\nDone! Next steps:")
    print(f"  1. Edit HackSmarter/{filename}.html with your walkthrough content")
    print(f"  2. Add images to assets/{filename}/")
    print(f"  3. Update search-index.json sections array with heading anchors & keywords")
    print(f"  4. Commit and push")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Blog site management tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    sub = parser.add_subparsers(dest="command")

    sub.add_parser("sync-sidebar", help="Update sidebar in all HTML files from sidebar.json")

    nm = sub.add_parser("new-machine", help="Scaffold a new HackSmarter walkthrough")
    nm.add_argument("--name", help="Machine display name")
    nm.add_argument("--filename", help="HTML filename (no extension)")
    nm.add_argument("--difficulty", help="Easy/Medium/Hard/Medium-Hard")
    nm.add_argument("--domain", help="Machine domain")
    nm.add_argument("--topics", help="Key topics (comma-separated)")
    nm.add_argument("--description", help="Short description for meta tags")
    nm.add_argument("--og-image", help="Open Graph image URL")

    args = parser.parse_args()

    if args.command == "sync-sidebar":
        sync_sidebar()
    elif args.command == "new-machine":
        new_machine(args)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
