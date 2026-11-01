import { JournalTemplate } from '@/types/journal'

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  {
    id: 'daily-journal',
    title: 'Daily Journal',
    description: 'A gentle, open space to chronicle the cadence, insights, and feelings of your day.',
    icon: 'book',
    colorTheme: 'peach',
    defaultTitle: 'Daily Musings & Observations',
    promptQuestion: 'What felt memorable or meaningful about today?',
    defaultEmotions: ['Reflective', 'Calm'],
    contentHtml: `
      <p>Today was marked by a quiet sense of curiosity. Here is what unfolded:</p>
      <h3>Highlights of the Day</h3>
      <p>A few moments that stood out:</p>
      <ul>
        <li>Morning stillness and a steady start.</li>
        <li>Progress on meaningful creative work.</li>
        <li>A pleasant interaction or unexpected insight.</li>
      </ul>
      <h3>Thoughts & Musings</h3>
      <p>What stayed on my mind throughout the afternoon and evening...</p>
    `,
  },
  {
    id: 'morning-reflection',
    title: 'Morning Reflection',
    description: 'Set your compass for the day with clarity, intention, and calm energy.',
    icon: 'sun',
    colorTheme: 'buttercream',
    defaultTitle: 'Morning Intention & Alignment',
    promptQuestion: 'What energy and single focus do you wish to embody today?',
    defaultEmotions: ['Focused', 'Motivated'],
    contentHtml: `
      <h3>1. What am I looking forward to today?</h3>
      <p>The opportunity to dive deeply into focused work and connect with what matters.</p>
      <h3>2. What is my primary priority?</h3>
      <p>Complete the core deliverable with elegance and generous whitespace.</p>
      <h3>3. How do I want to feel today?</h3>
      <p>Grounded, composed, and unhurried.</p>
      <h3>4. What would make today a success?</h3>
      <p>Staying present during challenging tasks and taking mindful pauses between focus blocks.</p>
    `,
  },
  {
    id: 'evening-reflection',
    title: 'Evening Reflection',
    description: 'Close open loops, acknowledge what went well, and unwind with quiet closure.',
    icon: 'moon',
    colorTheme: 'lavender',
    defaultTitle: 'Evening Review & Wins',
    promptQuestion: 'What did you accomplish, and what gave you energy today?',
    defaultEmotions: ['Peaceful', 'Grateful'],
    contentHtml: `
      <h3>1. What went well today?</h3>
      <p>Moments of uninterrupted flow, clear decision-making, and calm consistency.</p>
      <h3>2. What did I accomplish?</h3>
      <p>Completed the planned milestones and protected my focus time.</p>
      <h3>3. What challenged me or caused friction?</h3>
      <p>A momentary urge to check notifications; responded by taking a brief stretch.</p>
      <h3>4. What did I learn, and what can I improve tomorrow?</h3>
      <p>Starting the day with a clearly framed intention removes decision fatigue.</p>
    `,
  },
  {
    id: 'gratitude-journal',
    title: 'Gratitude Journal',
    description: 'Celebrate three specific things you appreciate to cultivate lasting joy.',
    icon: 'heart',
    colorTheme: 'pink',
    defaultTitle: 'Three Graces of Today',
    promptQuestion: 'What three distinct gifts, people, or moments are you thankful for?',
    defaultEmotions: ['Grateful', 'Happy'],
    contentHtml: `
      <p>Taking a pause to appreciate the abundance present in ordinary moments:</p>
      <h3>1. The First Grace</h3>
      <p>Warm morning tea and the quiet stillness before the digital world woke up.</p>
      <h3>2. The Second Grace</h3>
      <p>A kind word of encouragement that lightened the afternoon sprint.</p>
      <h3>3. The Third Grace</h3>
      <p>The ability to create, learn, and cultivate an intentional personal craft.</p>
    `,
  },
  {
    id: 'weekly-reflection',
    title: 'Weekly Reflection',
    description: 'Zoom out to synthesize the week’s trajectory, rhythm, and weekly milestones.',
    icon: 'calendar',
    colorTheme: 'powder',
    defaultTitle: 'Weekly Synthesis & Trajectory',
    promptQuestion: 'Looking across the past seven days, where did your time and energy flow?',
    defaultEmotions: ['Reflective', 'Calm'],
    contentHtml: `
      <h3>Big Picture Assessment</h3>
      <p>Reflecting on energy levels, habit consistency, and creative output across the week:</p>
      <h3>What Worked Beautifully</h3>
      <ul>
        <li>Maintained morning routine without skipping scheduled days.</li>
        <li>Eliminated clutter from the digital desk.</li>
      </ul>
      <h3>What Needed Course Correction</h3>
      <p>Pacing during mid-week afternoons; need more structured micro-breaks.</p>
      <h3>Theme for the Coming Week</h3>
      <p>Simplicity, execution depth, and steady consistency.</p>
    `,
  },
  {
    id: 'goals-reflection',
    title: 'Goals Reflection',
    description: 'Examine milestone velocity, friction points, and motivation behind your ambitions.',
    icon: 'target',
    colorTheme: 'sage',
    defaultTitle: 'Milestones & Strategic Alignment',
    promptQuestion: 'How are your daily habits serving your overarching quarterly goals?',
    defaultEmotions: ['Focused', 'Motivated'],
    contentHtml: `
      <h3>Current Goal Under Review</h3>
      <p>Evaluating progress against primary quarterly objectives:</p>
      <h3>Wins & Forward Momentum</h3>
      <p>Milestones that moved from in-progress to completed this period.</p>
      <h3>Friction & Roadblocks</h3>
      <p>Areas where uncertainty or complexity slowed down execution, and how to unblock them.</p>
      <h3>Next Decisive Action</h3>
      <p>The single highest-leverage task to tackle first.</p>
    `,
  },
  {
    id: 'free-writing',
    title: 'Free Writing',
    description: 'Unfiltered stream of consciousness to dissolve mental fog and let ideas flow.',
    icon: 'feather',
    colorTheme: 'ivory',
    defaultTitle: 'Stream of Consciousness',
    promptQuestion: 'Write without self-censorship. What is currently occupying your mind?',
    defaultEmotions: ['Reflective'],
    contentHtml: `
      <p>Letting pen meet paper without expectations, judgments, or filters...</p>
      <p>The mind feels like a quiet room today. Ideas are gently floating to the surface, ready to be explored with curiosity and patient attention.</p>
    `,
  },
  {
    id: 'learning-reflection',
    title: 'Learning Reflection',
    description: 'Synthesize mental models, book excerpts, and architectural insights.',
    icon: 'lightbulb',
    colorTheme: 'buttercream',
    defaultTitle: 'Synthesis & Mental Models',
    promptQuestion: 'What core concept or paradigm shifted your perspective recently?',
    defaultEmotions: ['Focused', 'Excited'],
    contentHtml: `
      <h3>Core Insight or Book Note</h3>
      <p>Concept: Natural mappings and progressive disclosure in everyday tools.</p>
      <h3>How It Connects to My Work</h3>
      <p>Interfaces should offer immediate tactile feedback without cognitive overwhelm.</p>
      <h3>Practical Application</h3>
      <p>Applying this model directly to the layout and typography of our workspace.</p>
    `,
  },
]

