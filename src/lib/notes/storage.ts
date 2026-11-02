import { Note, Folder } from '@/types/notes'

export const INITIAL_SAMPLE_FOLDERS: Folder[] = [
  {
    id: 'folder-personal',
    userId: 'default-user',
    name: 'Personal & Mindful',
    color: 'peach',
    icon: 'user',
    noteCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'folder-work',
    userId: 'default-user',
    name: 'Work & Projects',
    color: 'powder',
    icon: 'briefcase',
    noteCount: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'folder-research',
    userId: 'default-user',
    name: 'Research & Ideas',
    color: 'lavender',
    icon: 'book',
    noteCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: 'note-1',
    userId: 'default-user',
    title: 'Workspace Vision & Pastel Principles',
    content: `
<h2>The Philosophy of a Digital Desk</h2>
<p>A personal workspace should inspire calm rather than hurry. By blending <strong>tactile pastel cards</strong> with generous whitespace, thoughts find room to breathe.</p>
<hr/>
<h3>Core Tenets:</h3>
<ul>
  <li><strong>Warmth over cold sterile gray:</strong> Surfaces should feel welcoming like artisanal stationery.</li>
  <li><strong>Intentionality over clutter:</strong> Keep primary actions visible, secondary actions contextual.</li>
  <li><strong>Gentle micro-interactions:</strong> Soft lifts and spring feedback make productivity feel natural.</li>
</ul>
<blockquote>&ldquo;Good tools don't command your attention; they give you yours back.&rdquo;</blockquote>
    `.trim(),
    colorTheme: 'buttercream',
    isPinned: true,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    tags: ['vision', 'design', 'principles'],
    folderId: 'folder-work',
    folderName: 'Work & Projects',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'note-2',
    userId: 'default-user',
    title: 'Weekly Sprint & Project Checklist',
    content: `
<h2>Product & Architecture Milestones</h2>
<p>Execution checklist for the Intelligent Notes module:</p>
<ul data-type="taskList">
  <li data-checked="true"><p>Install &amp; verify TipTap rich text engine</p></li>
  <li data-checked="true"><p>Build pastel card grid &amp; compact list switcher</p></li>
  <li data-checked="true"><p>Implement folder and tag organization drawer</p></li>
  <li data-checked="true"><p>Add debounced autosave with visual status</p></li>
  <li data-checked="true"><p>Configure quick-create modal &amp; keyboard shortcuts</p></li>
</ul>
    `.trim(),
    colorTheme: 'sage',
    isPinned: true,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    tags: ['engineering', 'sprint'],
    folderId: 'folder-work',
    folderName: 'Work & Projects',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'note-3',
    userId: 'default-user',
    title: 'Mindful Morning Routines',
    content: `
<h2>Intentional Mornings</h2>
<p>Setting the cadence for clear thought before opening communications:</p>
<ol>
  <li>5 minutes of silent gratitude</li>
  <li>Hydrate with warm tea</li>
  <li>Review today's top 3 intention sticky notes</li>
</ol>
<p>Protecting the first 60 minutes prevents cognitive fragmentation.</p>
    `.trim(),
    colorTheme: 'peach',
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    tags: ['wellness', 'habits'],
    folderId: 'folder-personal',
    folderName: 'Personal & Mindful',
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'note-4',
    userId: 'default-user',
    title: 'Knowledge Graph & Backlinks Research',
    content: `
<h2>Bi-Directional Knowledge Networks</h2>
<p>Exploring how notes relate to each other semantically using <code>[[wikilinks]]</code> and vector similarity.</p>
<p>When notes reference shared concepts, an emergent personal knowledge graph forms without forced hierarchical folders.</p>
<p>Gemini vector embeddings compute semantic nearest neighbors across your personal workspace corpus automatically.</p>
    `.trim(),
    colorTheme: 'lavender',
    isPinned: false,
    isFavorite: false,
    isArchived: false,
    isTrashed: false,
    tags: ['research', 'ai', 'graph'],
    folderId: 'folder-research',
    folderName: 'Research & Ideas',
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'note-5',
    userId: 'default-user',
    title: 'Reading Notes: The Psychology of Money',
    content: `
<h2>Key Insights &amp; Takeaways</h2>
<p><strong>Theme:</strong> Doing well with money has a little to do with how smart you are and a lot to do with how you behave.</p>
<blockquote>&ldquo;Spending money to show people how much money you have is the fastest way to have less money.&rdquo;</blockquote>
<ul>
  <li>True wealth is what you don't see (flexibility, freedom).</li>
  <li>Compounding requires endurance above all else.</li>
</ul>
    `.trim(),
    colorTheme: 'powder',
    isPinned: false,
    isFavorite: true,
    isArchived: false,
    isTrashed: false,
    tags: ['reading', 'finance'],
    folderId: 'folder-personal',
    folderName: 'Personal & Mindful',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
]

const LOCAL_STORAGE_KEY_NOTES = 'notepad_ai_notes_v1'
const LOCAL_STORAGE_KEY_FOLDERS = 'notepad_ai_folders_v1'

let memoryNotes: Note[] = [...INITIAL_SAMPLE_NOTES]
let memoryFolders: Folder[] = [...INITIAL_SAMPLE_FOLDERS]

export function getLocalNotes(): Note[] {
  if (typeof window === 'undefined') return memoryNotes
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(INITIAL_SAMPLE_NOTES))
      return INITIAL_SAMPLE_NOTES
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SAMPLE_NOTES
  }
}

export function saveLocalNotes(notes: Note[]): void {
  memoryNotes = notes
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(notes))
  } catch (e) {
    console.error('Failed to write local notes:', e)
  }
}

export function getLocalFolders(): Folder[] {
  if (typeof window === 'undefined') return memoryFolders
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_FOLDERS)
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_FOLDERS, JSON.stringify(INITIAL_SAMPLE_FOLDERS))
      return INITIAL_SAMPLE_FOLDERS
    }
    return JSON.parse(raw)
  } catch {
    return INITIAL_SAMPLE_FOLDERS
  }
}

export function saveLocalFolders(folders: Folder[]): void {
  memoryFolders = folders
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_FOLDERS, JSON.stringify(folders))
  } catch (e) {
    console.error('Failed to write local folders:', e)
  }
}

