"""
AI Productivity Coach and Mission Assistant for VYRON
Uses the API key securely placed in .env
"""

import os
import json
import requests
from django.conf import settings

def get_api_key():
    return getattr(settings, 'API_KEY', '') or os.getenv('API_KEY', '') or os.getenv('GEMINI_API_KEY', '')

def suggest_missions_ai(user_goal: str, category: str = 'Coding'):
    """
    Given a user's overarching goal (e.g. 'Learn React & Build a Dashboard' or 'Prepare for BCA Exams'),
    suggests 3 gamified missions with difficulty, focus time, and description.
    """
    api_key = get_api_key()
    
    prompt = f"""You are VYRON, a futuristic cybernetic gamified productivity AI coach.
The user wants to achieve this goal: "{user_goal}".
Category: {category}.

Break this goal down into 3 clear, actionable, bite-sized gamified missions.
For each mission return a JSON array of objects with:
- "title": short mission title (3-60 chars)
- "description": 1-2 sentence motivating mission objective
- "category": "{category}"
- "difficulty": "Easy" or "Medium" or "Hard"
- "focus_minutes": 25 or 45 or 60

Output ONLY valid JSON array with no extra markdown text or backticks if possible."""

    # Try calling Google Gemini API if configured
    if api_key and not api_key.startswith("AQ.dummy"):
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800}
            }
            res = requests.post(url, json=payload, timeout=8)
            if res.status_code == 200:
                data = res.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text'].strip()
                # Clean code blocks
                if text_content.startswith("```"):
                    lines = text_content.splitlines()
                    if lines[0].startswith("```"):
                        lines = lines[1:]
                    if lines and lines[-1].startswith("```"):
                        lines = lines[:-1]
                    text_content = "\n".join(lines).strip()
                parsed = json.loads(text_content)
                if isinstance(parsed, list) and len(parsed) > 0:
                    return parsed
        except Exception as e:
            print(f"[VYRON AI] Note: Gemini API call: {e}, falling back to intelligent templates.")
            
    # Intelligent fallback templates if network or offline
    fallbacks = {
        'Coding': [
            {"title": f"Plan Architecture: {user_goal}", "description": "Draft component hierarchy and API data contracts.", "category": "Coding", "difficulty": "Easy", "focus_minutes": 25},
            {"title": f"Implement Core Logic: {user_goal}", "description": "Code core functional services, state stores, and error handlers.", "category": "Coding", "difficulty": "Medium", "focus_minutes": 45},
            {"title": f"Ship & Test Prototype: {user_goal}", "description": "Perform end-to-end testing, optimize styling, and deploy.", "category": "Coding", "difficulty": "Hard", "focus_minutes": 60},
        ],
        'Study': [
            {"title": f"Deep Dive Reading: {user_goal}", "description": "Review key lecture notes, formulas, and textbook chapters.", "category": "Study", "difficulty": "Easy", "focus_minutes": 30},
            {"title": f"Active Recall & Flashcards: {user_goal}", "description": "Test understanding of critical definitions without looking at notes.", "category": "Study", "difficulty": "Medium", "focus_minutes": 35},
            {"title": f"Solve Practice Problems: {user_goal}", "description": "Complete past exam questions under timed conditions.", "category": "Study", "difficulty": "Hard", "focus_minutes": 50},
        ],
        'Work': [
            {"title": f"Draft Proposal & Scope: {user_goal}", "description": "Define deliverables, timeline, and key milestones.", "category": "Work", "difficulty": "Easy", "focus_minutes": 30},
            {"title": f"Execute Core Deliverables: {user_goal}", "description": "Focus on high-impact work items without distractions.", "category": "Work", "difficulty": "Medium", "focus_minutes": 45},
            {"title": f"Review & Present Results: {user_goal}", "description": "Polish presentation and share updates with stakeholders.", "category": "Work", "difficulty": "Hard", "focus_minutes": 45},
        ]
    }
    return fallbacks.get(category, fallbacks['Coding'])

def get_coaching_advice_ai(user_name: str, level: int, streak: int, completion_rate: int):
    """Generates dynamic cyber-styled coaching advice based on current stats."""
    api_key = get_api_key()
    
    if streak >= 5:
        streak_vibe = "on an unstoppable streak!"
    elif streak >= 1:
        streak_vibe = "building solid momentum."
    else:
        streak_vibe = "ready to ignite a new streak today."

    return {
        "headline": f"Commander {user_name}, status: Level {level}",
        "message": f"Your city is expanding! With a {completion_rate}% weekly productivity rating, you are {streak_vibe} Keep clearing missions to fund your next architectural marvel.",
        "tip": "Tip: Complete missions on or before their due date to claim the +10% On-Time XP Bonus!"
    }
