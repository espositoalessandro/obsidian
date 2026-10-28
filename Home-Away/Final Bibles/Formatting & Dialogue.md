# Formatting & Dialogue Standards

> **Status: LOCKED FORMATTING BIBLE**
>
> This file is the source of truth for punctuation, dialogue formatting and recurring Markdown conventions in the Final rewrite.
>
> These rules govern **formatting**, not character voice. Deliberately rough, fragmented or non-standard speech may remain when it belongs to the speaker.

---

# 1. Core Typography

Use these characters consistently in Final chapters:

- Dialogue quotation marks: straight double quotes — `"Dialogue."`
- Apostrophes / contractions / possessives: straight apostrophe — `don't`, `Leo's`
- Quotes inside dialogue: straight single quotes — `"He said, 'I'm leaving.'"`
- Ellipsis: three periods — `...`
- Abrupt interruption / cutoff: em dash — `—`
- Markdown italics: asterisks — `*text*`
- Scene separator: `***`

Do **not** use:

- curly quotation marks: `“ ”`
- curly apostrophes: `‘ ’`
- Unicode ellipsis: `…`
- en dash: `–`
- underscore italics: `_text_`

### Hyphen vs em dash

Use the ordinary hyphen `-` for:

- compound words: `self-sufficient`;
- deliberate stutters: `I- I don't know`, `t-that`;
- the chapter-heading separator: `### Chapter 10 - Away`.

Use the em dash `—` for an abrupt cutoff:

```
"I don't know—"
```

```
"What the fuck does that even—"
```

No spaces around the em dash.

---

# 2. Basic Dialogue Punctuation

### Speech tag after a statement

```
"Fine," Taiga said.
```

### Speech tag after a question or exclamation

Keep the question mark or exclamation mark. Do not add a comma after the closing quote.

```
"What?" Leo asked.
"No!" Enzo shouted.
```

Not:

```
"What?", Leo asked.
```

### Speech tag in the middle of one grammatical sentence

```
"I know," Leo said, "but I'm still going."
```

Use this only when the tag is actually a speech tag such as `said`, `asked`, `whispered`, `shouted`, etc.

---

# 3. Action Beats Are Not Speech Tags

Actions such as `smiled`, `laughed`, `exhaled`, `shrugged`, `nodded`, `blinked`, `bit his lip`, etc. are their own sentences.

Correct:

```
"Fair enough." Leo smiled. "Thankies!"
```

```
"Because..." He exhaled. "We both know he'll make the situation worse."
```

```
"Hey! Uh—" She bit her lip for a second. "Caleb, we need to go to... do that uh- stuff."
```

Incorrect:

```
"Fair enough," Leo smiled.
"Because," he exhaled.
```

A physical action may deliberately interrupt the speaker. **Keep the interruption. Fix the punctuation around it rather than removing the action.**

Do not use em dashes to wrap an action beat inside dialogue:

```
"I don't think"—Leo smiled—"that's going to work."
```

That construction is not part of the novel's house style.

Instead, preserve the rhythm as separate dialogue and action units:

```
"I don't think..." Leo smiled. "That's going to work."
```

---

# 4. Cutoffs, Pauses and Stutters

These are different effects and should not be normalized into one another.

### Abrupt cutoff

Use an em dash:

```
"Nice to meet y—"
```

```
"It's—" Aaron gulped. "Probably fuck everything up."
```

### Trailing off / hesitation

Use an ellipsis:

```
"Because..." He exhaled. "We both know he'll make the situation worse."
```

### Stutter

Use a short hyphen:

```
"I- I think t-that could work."
```

Do not replace deliberate stutter hyphens with em dashes.

### Another speaker finishes or picks up the interrupted phrase

A leading em dash may be used when the second line is explicitly completing the cutoff:

```
"These costumes are all a bit—"

"—revealing?" Sofia concluded.
```

---

# 5. Dialogue + Action Timing

Dialogue does **not** need an action beat attached to every line.

Keep an action beat when it does at least one useful job:

- establishes physical staging;
- changes timing;
- communicates subtext not already present in the words;
- carries a joke;
- identifies an otherwise ambiguous speaker;
- shows a meaningful reaction.

Delete it when the dialogue already communicates the same thing and the beat only exists to fill space.

Do not replace repetitive `said` with decorative speech verbs merely for variety. `Said` is intentionally unobtrusive.

---

# 6. Italics

Use Markdown asterisks:

```
*text*
```

Do not use underscores.

Italics may be used for established emphasis, titles, quoted written material, or deliberately foregrounded words. Do not italicize ordinary emphasis so frequently that it becomes visual noise.

---

# 7. Text Messages

Use the established format, repeating the bold sender label on every message line.

- Consecutive messages from the same person use a single line break, with no blank line between them.
- Use a blank line when the sender changes.
- Keep narration separate from the messages with a blank line. A new message after intervening narration begins a new paragraph, even if it is from the same sender.

```
**Taiga:** you done?

**Leo:** almost
**Leo:** i hope
**Leo:** don't leave

Taiga looked over.
```

Do not split consecutive messages from the same sender into separate paragraphs during formatting cleanup.

Character-specific texting capitalization, punctuation and spelling may remain non-standard when intentional.

---

# 8. Scene Breaks

Use exactly:

```
***
```

Keep one blank line before and after the separator.

Do not use ornamental alternatives.

---

# 9. Chapter Headings

Use:

```
### Chapter 10 - Away
```

The short hyphen in the chapter heading is intentional and is **not** replaced with an em dash.

---

# 10. Final Formatting Audit

Before freezing a chapter, verify:

- straight double quotes only;
- straight apostrophes only;
- `...` rather than `…`;
- em dashes for abrupt dialogue cutoffs;
- short hyphens preserved for stutters and compounds;
- actions are punctuated as action beats, not speech tags;
- no accidental `"?", said` / `"!", said` punctuation;
- asterisks rather than underscores for italics;
- `***` scene separators;
- heading format is consistent;
- no trailing spaces;
- consecutive text messages from the same sender use single line breaks; sender changes and intervening narration use blank lines;
- no accidental extra blank lines;
- no broken Markdown.

When a character's voice intentionally conflicts with textbook grammar, **voice wins** as long as the construction is deliberate, readable and consistent with `Prose & Voice.md`.
