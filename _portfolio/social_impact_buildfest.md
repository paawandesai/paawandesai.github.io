---
title: "Social Impact BuildFest – EveryLibrary Advocacy Project"
excerpt: "A desktop app that reads advocacy text aloud and turns its emotional intensity into haptic feedback."
collection: portfolio
layout: single
group: earlier
order: 3
flow_caption: "From text to touch"
flow:
  - { t: "Advocacy text", s: "one sentence at a time" }
  - { t: "Sentiment", s: "lexicons + transformer", hot: true }
  - { t: "Text-to-speech", s: "read aloud" }
  - { t: "Haptics", s: "DataFeel commands", hot: true }
---

[View on GitHub](https://github.com/txibuildfest25/buildfest_website/tree/main)

### Overview
At the Social Impact BuildFest, I built a desktop app to support EveryLibrary's advocacy work. It reads text one sentence at a time, estimates the emotional intensity of each sentence, reads it aloud, and converts that intensity into vibration on DataFeel haptic devices. The goal was to give people with visual impairments or learning disabilities another way to experience the writing.

### How it works
- Sentiment comes from NLTK word lists and phrase rules, combined with a Hugging Face transformer model.
- Text-to-speech reads each sentence while the device plays the matching pattern.
- Whole folders of text can be processed at once, with a timeline chart of how the emotion changes.
- The interface supports dyslexia-friendly fonts (OpenDyslexic and Atkinson Hyperlegible), adjustable contrast and font size.

### Tools
Python, PyQt6, NLTK, Hugging Face, Matplotlib, pyttsx3, DataFeel SDK
