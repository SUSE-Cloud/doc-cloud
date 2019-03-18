#!/usr/bin/python3
import re
import sys

# The title of an rst doc has a line of text with a line of special characters
# (such as = ~ - ) below it, and optionally above it
TITLE_WITH_BOTH_LINES = r'^(((=+|~+|-+)\n).+\n\2)'
TITLE_WITH_ONLY_UNDERLINE = r'^(.+\n(=+|~+|-+)\n)'

if len(sys.argv) != 3:
    print("Usage: fix_title.py FILENAME NEW-TITLE\n")
    sys.exit(1)

filename = sys.argv[1]
title = sys.argv[2]

formatted_title = '{0}\n{1}\n{0}\n'.format('=' * len(title), title)

try:
    with open(filename) as f:
        contents = f.read()

    match_both = re.search(TITLE_WITH_BOTH_LINES, contents, re.MULTILINE)
    match_under = re.search(TITLE_WITH_ONLY_UNDERLINE, contents, re.MULTILINE)

    if match_both:
        # replace surrouunded title with new title
        contents = contents[:match_both.start(1)] + formatted_title + \
            contents[match_both.end(1):]
    elif match_under:
        # Replace underlined contents with new title
        contents = contents[:match_under.start(1)] + formatted_title + \
            contents[match_under.end(1):]
    else:
        # prepend title to contents
        contents = formatted_title + contents

    with open(filename, "w") as f:
        f.write(contents)

except IOError as e:
    print("IO Error:", e)

except Exception as e:
    print("failed:", e)
