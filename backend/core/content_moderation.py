"""
Content moderation utilities for detecting inappropriate content in questions and answers.
"""

import re

# List of adult/inappropriate keywords to flag
ADULT_KEYWORDS = [
    # Sexual content
    'sex', 'porn', 'xxx', 'nude', 'naked', 'sexual', 'erotic', 'orgasm',
    'penis', 'vagina', 'dick', 'cock', 'pussy', 'boobs', 'breast',
    'masturbate', 'masturbation', 'oral sex', 'anal sex',

    # Violence
    'kill', 'murder', 'suicide', 'rape', 'assault', 'abuse', 'torture',
    'terrorist', 'terrorism', 'bomb', 'weapon', 'gun', 'knife',

    # Drugs
    'cocaine', 'heroin', 'meth', 'marijuana', 'cannabis', 'weed', 'drug dealer',
    'overdose', 'narcotic',

    # Hate speech
    'hate', 'racist', 'racism', 'nazi', 'fascist', 'supremacy',

    # Other inappropriate
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'hell',
    'whore', 'slut', 'cunt',
]


def contains_adult_keywords(text):
    """
    Check if the given text contains any adult/inappropriate keywords.

    Args:
        text (str): The text to check

    Returns:
        tuple: (bool, list) - (contains_keywords, list_of_found_keywords)
    """
    if not text:
        return False, []

    # Convert to lowercase for case-insensitive matching
    text_lower = text.lower()

    found_keywords = []

    for keyword in ADULT_KEYWORDS:
        # Use word boundaries to avoid false positives
        # e.g., "class" should not match "ass"
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text_lower):
            found_keywords.append(keyword)

    return len(found_keywords) > 0, found_keywords


def check_question_content(title, content):
    """
    Check both title and content of a question for adult keywords.

    Args:
        title (str): Question title
        content (str): Question content

    Returns:
        tuple: (is_flagged, reason)
    """
    # Check title
    title_flagged, title_keywords = contains_adult_keywords(title)

    # Check content
    content_flagged, content_keywords = contains_adult_keywords(content)

    is_flagged = title_flagged or content_flagged

    if is_flagged:
        all_keywords = list(set(title_keywords + content_keywords))
        reason = f"Contains inappropriate keywords: {', '.join(all_keywords)}"
        return True, reason

    return False, None
