#!/usr/bin/env python3
"""
DDB Book Scraper — Pulls sourcebook content from D&D Beyond using Cobalt cookie auth.
Usage: python3 scrape_ddb.py <base_slug> <chapter1> <chapter2> ... -o <output_file>
"""

import re
import os
import sys
import subprocess
import time

COBALT_PATH = os.path.expanduser("~/.openclaw/secrets/ddb-cobalt.txt")
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"


def get_cobalt():
    with open(COBALT_PATH) as f:
        return f.read().strip()


def fetch_chapter(base_slug, chapter_slug, cobalt):
    """Fetch a chapter page from DDB and return the HTML."""
    url = f"https://www.dndbeyond.com/sources/{base_slug}/{chapter_slug}"
    result = subprocess.run(
        ["curl", "-s", "-L", url,
         "-H", f"Cookie: CobaltSession={cobalt}",
         "-H", f"User-Agent: {USER_AGENT}"],
        capture_output=True, text=True, timeout=30
    )
    return result.stdout


def html_to_markdown(html):
    """Extract and convert the article content to markdown."""
    match = re.search(r'<div class="p-article-content u-typography-format">(.*?)<footer', html, re.DOTALL)
    if not match:
        return ""
    
    text = match.group(1)
    
    # Headers
    for i in range(1, 6):
        text = re.sub(
            rf'<h{i}[^>]*>(.*?)</h{i}>',
            lambda m, level=i: '\n' + '#' * level + ' ' + re.sub(r'<[^>]+>', '', m.group(1)) + '\n',
            text, flags=re.DOTALL
        )
    
    # Bold/italic
    text = re.sub(r'<strong>(.*?)</strong>', r'**\1**', text)
    text = re.sub(r'<em>(.*?)</em>', r'*\1*', text)
    
    # Blockquotes
    text = re.sub(
        r'<blockquote[^>]*>(.*?)</blockquote>',
        lambda m: '\n> ' + re.sub(r'<[^>]+>', '', m.group(1)).strip().replace('\n', '\n> ') + '\n',
        text, flags=re.DOTALL
    )
    
    # Tables
    text = re.sub(r'<th[^>]*>(.*?)</th>', lambda m: '| ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + ' ', text, flags=re.DOTALL)
    text = re.sub(r'<td[^>]*>(.*?)</td>', lambda m: '| ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + ' ', text, flags=re.DOTALL)
    text = re.sub(r'<tr[^>]*>', '', text)
    text = re.sub(r'</tr>', '|\n', text)
    
    # List items
    text = re.sub(r'<li[^>]*>(.*?)</li>', lambda m: '- ' + re.sub(r'<[^>]+>', '', m.group(1)).strip() + '\n', text, flags=re.DOTALL)
    
    # Paragraphs
    text = re.sub(r'<p[^>]*>(.*?)</p>', lambda m: re.sub(r'<[^>]+>', '', m.group(1)) + '\n\n', text, flags=re.DOTALL)
    
    # Strip remaining tags
    text = re.sub(r'<[^>]+>', '', text)
    
    # HTML entities
    entities = {
        '&rsquo;': "'", '&lsquo;': "'", '&rdquo;': '"', '&ldquo;': '"',
        '&mdash;': '—', '&ndash;': '–', '&amp;': '&', '&lt;': '<', '&gt;': '>',
        '&nbsp;': ' ', '&times;': '×', '&hellip;': '…', '&minus;': '-',
        '&frac12;': '½', '&frac14;': '¼', '&frac34;': '¾',
    }
    for ent, rep in entities.items():
        text = text.replace(ent, rep)
    text = re.sub(r'&#x?[0-9a-fA-F]+;', '', text)
    text = re.sub(r'&[a-z]+;', '', text)
    
    # Clean up whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def scrape_book(base_slug, chapters, output_path, title=""):
    """Scrape all chapters and write to a single markdown file."""
    cobalt = get_cobalt()
    
    output = f"# {title}\n\n---\n\n"
    total_chars = 0
    
    for chapter in chapters:
        print(f"  Fetching {chapter}...", end=" ", flush=True)
        html = fetch_chapter(base_slug, chapter, cobalt)
        content = html_to_markdown(html)
        
        if content:
            total_chars += len(content)
            print(f"{len(content)} chars")
            output += f"\n\n{'=' * 60}\n"
            output += f"# {chapter.replace('-', ' ').title()}\n"
            output += f"{'=' * 60}\n\n"
            output += content + "\n\n---\n\n"
        elif 'marketplace' in html[:5000].lower():
            print("MARKETPLACE (not owned?)")
        else:
            print("empty/error")
        
        time.sleep(0.5)  # Be nice to DDB
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w') as f:
        f.write(output)
    
    print(f"\nTotal: {total_chars} chars ({total_chars // 1024} KB)")
    print(f"Saved to: {output_path}")
    return total_chars


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 scrape_ddb.py <base_slug> <output_file> <chapter1> [chapter2] ...")
        print("Example: python3 scrape_ddb.py phb /path/to/phb.md classes fighter wizard")
        sys.exit(1)
    
    base_slug = sys.argv[1]
    output_file = sys.argv[2]
    chapters = sys.argv[3:]
    
    scrape_book(base_slug, chapters, output_file, title=base_slug.upper())
