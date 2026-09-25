from pathlib import Path
index=Path("index.html")
snippet=Path("nle-rewards-snippet.html").read_text(encoding="utf-8")
text=index.read_text(encoding="utf-8")
if "<!-- NLE_REWARDS_START -->" not in text:
    marker="</body>"
    if marker not in text:
        raise SystemExit("No </body> marker")
    text=text.replace(marker,snippet+"\n"+marker,1)
    index.write_text(text,encoding="utf-8")
    print("NLE Rewards installed")
else:
    print("NLE Rewards already installed")
