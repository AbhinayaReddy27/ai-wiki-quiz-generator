from typing import Dict, List
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; AIWikiQuizBot/1.0; +https://example.com/bot)"
}

def scrape_wikipedia_article(url: str) -> Dict:
    """Scrape a Wikipedia article via HTML (no Wikipedia API)."""
    resp = requests.get(url, headers=HEADERS, timeout=20)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")

    # Title
    title_el = soup.find("h1", id="firstHeading")
    if title_el:
        title = title_el.get_text(strip=True)
    else:
        title = soup.title.get_text(strip=True) if soup.title else url

    # Summary: first non-empty paragraph in the main content
    content = soup.find("div", id="mw-content-text")
    summary = ""
    sections: List[str] = []
    article_text_parts: List[str] = []

    if content:
        paragraphs = content.find_all("p", recursive=True)
        for p in paragraphs:
            text = p.get_text(" ", strip=True)
            if text:
                article_text_parts.append(text)
                if not summary:
                    summary = text
        # Sections based on h2/h3
        for header in content.find_all(["h2", "h3"]):
            span = header.find("span", class_="mw-headline")
            if span:
                sections.append(span.get_text(strip=True))

    article_text = "\n\n".join(article_text_parts)

    return {
        "title": title,
        "summary": summary,
        "sections": sections,
        "article_text": article_text,
    }
