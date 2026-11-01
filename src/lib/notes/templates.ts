import { PastelColorKey } from '@/lib/constants/colors'

export interface NoteTemplate {
  id: string
  name: string
  description: string
  defaultTitle: string
  defaultColor: PastelColorKey
  defaultTags: string[]
  contentHtml: string
}

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'quick-note',
    name: 'Quick Note',
    description: 'A clean pastel canvas for fleeting thoughts and quick reminders.',
    defaultTitle: 'Quick Thought',
    defaultColor: 'buttercream',
    defaultTags: ['quick', 'inbox'],
    contentHtml: `
<p>Capture what is on your mind right now...</p>
<ul data-type="taskList">
  <li data-checked="false"><p>Actionable item</p></li>
</ul>
    `.trim(),
  },
  {
    id: 'meeting-notes',
    name: 'Meeting Notes',
    description: 'Structured agenda, attendees, discussion points, and action items.',
    defaultTitle: 'Sync & Discussion',
    defaultColor: 'powder',
    defaultTags: ['meeting', 'work'],
    contentHtml: `
<h2>Meeting Overview</h2>
<p><strong>Date:</strong> Today &nbsp;|&nbsp; <strong>Attendees:</strong> Alex, Team</p>
<hr/>
<h3>Agenda</h3>
<ul>
  <li>Objective &amp; Context</li>
  <li>Key Discussion Points</li>
  <li>Blockers &amp; Questions</li>
</ul>
<h3>Key Takeaways</h3>
<p>Summary of decisions made during the conversation.</p>
<h3>Action Items</h3>
<ul data-type="taskList">
  <li data-checked="false"><p>Follow up with engineering on API spec</p></li>
  <li data-checked="false"><p>Review design tokens update</p></li>
</ul>
    `.trim(),
  },
  {
    id: 'daily-journal',
    name: 'Daily Reflection',
    description: 'Morning intentions, grateful reflections, and mindful check-in.',
    defaultTitle: 'Daily Reflection',
    defaultColor: 'peach',
    defaultTags: ['mindful', 'reflection'],
    contentHtml: `
<h2>Today's Intentions</h2>
<p>What is the single most meaningful focus for today?</p>
<blockquote>&ldquo;Clarity comes from creating intentional space.&rdquo;</blockquote>
<h3>Three Things I'm Grateful For</h3>
<ol>
  <li>The morning calm and coffee</li>
  <li>Progress made on creative projects</li>
  <li>Supportive collaborators</li>
</ol>
<h3>Evening Reflection</h3>
<p>What went well today? What could be approached with more ease tomorrow?</p>
    `.trim(),
  },
  {
    id: 'study-notes',
    name: 'Study & Learning Notes',
    description: 'Cornell-inspired study format with key concepts, details, and summary.',
    defaultTitle: 'Concept Exploration',
    defaultColor: 'lavender',
    defaultTags: ['learning', 'research'],
    contentHtml: `
<h2>Topic: Core Principles</h2>
<p><strong>Subject:</strong> Knowledge Architecture &nbsp;|&nbsp; <strong>Date:</strong> Today</p>
<hr/>
<h3>Key Terminology &amp; Hypotheses</h3>
<p>Define the central theory and terminology here.</p>
<h3>Deep Dive &amp; Notes</h3>
<ul>
  <li>First fundamental concept</li>
  <li>Supporting observations and references</li>
  <li>Edge cases and counterexamples</li>
</ul>
<h3>Summary &amp; Recall Questions</h3>
<p>Write a 2-sentence synthesis in your own words.</p>
    `.trim(),
  },
  {
    id: 'project-planning',
    name: 'Project Planning',
    description: 'Milestone breakdown, scope definitions, and deliverables checklist.',
    defaultTitle: 'Project Blueprint',
    defaultColor: 'sage',
    defaultTags: ['project', 'planning'],
    contentHtml: `
<h2>Project Objective</h2>
<p>Describe the target outcome and why this milestone matters.</p>
<hr/>
<h3>Scope &amp; Deliverables</h3>
<ul>
  <li>Deliverable 01: Core component specification</li>
  <li>Deliverable 02: Database persistence &amp; API routes</li>
  <li>Deliverable 03: End-to-end user verification</li>
</ul>
<h3>Milestone Checklist</h3>
<ul data-type="taskList">
  <li data-checked="false"><p>Draft architectural requirements</p></li>
  <li data-checked="false"><p>Implement data access layer</p></li>
  <li data-checked="false"><p>Verify responsive UI layout</p></li>
</ul>
    `.trim(),
  },
  {
    id: 'idea-capture',
    name: 'Idea Capture & Brainstorm',
    description: 'Rapid ideation canvas with problem statements and solution hypotheses.',
    defaultTitle: 'Creative Concept',
    defaultColor: 'pink',
    defaultTags: ['ideas', 'creative'],
    contentHtml: `
<h2>The Opportunity</h2>
<p>What problem are we trying to solve? Who is affected?</p>
<hr/>
<h3>Proposed Solutions</h3>
<ul>
  <li>Idea 1: Minimalist tactile interface</li>
  <li>Idea 2: Automated AI contextual briefs</li>
</ul>
<h3>Potential Impact &amp; Next Step</h3>
<p>How will we measure whether this idea works?</p>
    `.trim(),
  },
  {
    id: 'reading-notes',
    name: 'Reading Notes & Literature',
    description: 'Book and article capture with notable quotes and personal synthesis.',
    defaultTitle: 'Book Takeaways',
    defaultColor: 'ivory',
    defaultTags: ['reading', 'books'],
    contentHtml: `
<h2>Title &amp; Author</h2>
<p><strong>Work:</strong> The Design of Everyday Things &nbsp;|&nbsp; <strong>Author:</strong> Don Norman</p>
<hr/>
<h3>Notable Quotations</h3>
<blockquote>&ldquo;Good design is actually a lot harder to notice than poor design, in part because good designs fit our needs so well that the design is invisible.&rdquo;</blockquote>
<h3>Main Arguments</h3>
<ul>
  <li>Affordances and signifiers guide natural intuition.</li>
  <li>Feedback loops prevent cognitive overload.</li>
</ul>
<h3>Personal Action Points</h3>
<ul data-type="taskList">
  <li data-checked="false"><p>Apply physical paper affordances to sticky cards</p></li>
</ul>
    `.trim(),
  },
]

