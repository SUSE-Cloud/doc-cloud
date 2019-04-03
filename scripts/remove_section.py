#!/usr/bin/python3
import re
import sys

# Remove a section of the document.  In this context a section is considered
# a portion of the document with the given header (text underlined with
# some special characters), followed by some lines of text, up until the next
# section header (which shares the same underline character as the first)
UNDERLINE = r'^(=+|~+|-+)\n$'

if len(sys.argv) != 3:
    print("Usage: fix_title.py SECTION-TITLE-REGEX FILENAME\n")
    sys.exit(1)

title = sys.argv[1]
filename = sys.argv[2]
start = -1
end = -1

try:
    with open(filename) as f:
        contents = f.readlines()

    for num, line in enumerate(contents):

        if start < 0:
            # Grab the next line to check for underlines
            if len(contents) > num+1:
                next_line = contents[num+1]
            else:
                next_line = ''

            # if the line matches the regex and the next line is the same
            # length but is just a string of underline chars, then we found
            # the section of interest
            if (re.search(title, line) and
                    len(line) == len(next_line) and
                    re.search(UNDERLINE, next_line)):
                start = num
                under_char = next_line[0]

        elif line[0] == under_char and num > start+1:
            end = num-1
            break

    if start > 0:
        if end < 0:
            end = len(contents)
        del contents[start:end]

        with open(filename, "w") as f:
            f.writelines(contents)

except IOError as e:
    print("IO Error:", e)
