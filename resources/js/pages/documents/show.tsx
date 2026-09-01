import { Head, Link } from '@inertiajs/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import {
    ArrowLeft,
    Bold,
    CheckCircle,
    FileText,
    Italic,
    List,
    ListOrdered,
    Loader2,
    Share2,
    Underline as UnderlineIcon,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { update, share as shareAction } from '@/actions/App/Http/Controllers/DocumentController';
import type { Document, ShareEntry } from '@/types';

/** Read Laravel's XSRF-TOKEN cookie — same token Inertia uses internally */
function getCsrfToken(): string {
    return decodeURIComponent(
        document.cookie
            .split('; ')
            .find((row) => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1] ?? '',
    );
}

interface Props {
    document: Document;
    isOwner: boolean;
    shares: ShareEntry[];
    ownerName: string;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function DocumentShow({ document: doc, isOwner, shares: initialShares, ownerName }: Props) {
    const [title, setTitle] = useState(doc.title);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [showShareModal, setShowShareModal] = useState(false);
    const [shares, setShares] = useState<ShareEntry[]>(initialShares);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const latestContentRef = useRef<string>(doc.content ?? '');
    const latestTitleRef = useRef<string>(doc.title);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            Placeholder.configure({ placeholder: 'Start writing your document...' }),
        ],
        content: doc.content ?? '',
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[60vh] p-6',
            },
        },
        onUpdate({ editor }) {
            latestContentRef.current = editor.getHTML();
            scheduleSave();
        },
    });

    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        setSaveStatus('saving');
        saveTimerRef.current = setTimeout(() => {
            doSave();
        }, 1500);
    }, []);

    const doSave = useCallback(async () => {
        try {
            const csrfToken = getCsrfToken();

            const res = await fetch(update(doc.id).url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'X-Inertia': 'false',
                },
                body: JSON.stringify({
                    title: latestTitleRef.current,
                    content: latestContentRef.current,
                }),
            });

            if (res.ok) {
                setSaveStatus('saved');
            } else {
                setSaveStatus('error');
            }
        } catch {
            setSaveStatus('error');
        }
    }, [doc.id]);

    function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const newTitle = e.target.value;
        setTitle(newTitle);
        latestTitleRef.current = newTitle;
        scheduleSave();
    }

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, []);

    return (
        <>
            <Head title={`${title || 'Untitled document'} — Ajaia Docs`} />

            <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
                {/* Top Nav */}
                <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/documents"
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white tracking-tight">Ajaia Docs</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Save status */}
                        <span className="text-sm flex items-center gap-1.5">
                            {saveStatus === 'saving' && (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" /><span className="text-gray-400">Saving…</span></>
                            )}
                            {saveStatus === 'saved' && (
                                <><CheckCircle className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Saved</span></>
                            )}
                            {saveStatus === 'error' && (
                                <span className="text-red-400">Save failed — try again</span>
                            )}
                        </span>

                        {isOwner && (
                            <button
                                id="share-btn"
                                onClick={() => setShowShareModal(true)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium"
                            >
                                <Share2 className="w-4 h-4" />
                                Share
                            </button>
                        )}

                        <Link
                            href="/settings/profile"
                            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                        >
                            M
                        </Link>
                    </div>
                </header>

                {/* Editor area */}
                <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
                    {/* Title input */}
                    <input
                        id="document-title"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        placeholder="Untitled document"
                        className="w-full text-3xl font-bold bg-transparent border-none outline-none text-white placeholder-gray-600 mb-4 px-6"
                    />

                    {!isOwner && (
                        <div className="mx-6 mb-4 px-3 py-2 rounded-lg bg-purple-900/30 border border-purple-800/50 text-purple-300 text-sm">
                            Shared with you by <strong>{ownerName}</strong>
                        </div>
                    )}

                    {/* Toolbar */}
                    {editor && <EditorToolbar editor={editor} />}

                    {/* Editor */}
                    <div className="mx-2 rounded-xl border border-gray-800 bg-gray-900 mt-2">
                        <EditorContent editor={editor} />
                    </div>
                </main>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    documentId={doc.id}
                    ownerName={ownerName}
                    shares={shares}
                    onClose={() => setShowShareModal(false)}
                    onShared={(newShare) => setShares((prev) => [...prev, newShare])}
                />
            )}
        </>
    );
}

// ─── Editor Toolbar ───────────────────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
    if (!editor) return null;

    const btn = (
        active: boolean,
        onClick: () => void,
        icon: React.ReactNode,
        title: string,
        id: string,
    ) => (
        <button
            id={id}
            title={title}
            onClick={onClick}
            className={`p-2 rounded-md transition-colors ${
                active
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
        </button>
    );

    return (
        <div className="mx-2 flex items-center gap-0.5 px-3 py-2 rounded-t-xl border border-b-0 border-gray-800 bg-gray-900/60 backdrop-blur flex-wrap">
            {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold className="w-4 h-4" />, 'Bold', 'toolbar-bold')}
            {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic className="w-4 h-4" />, 'Italic', 'toolbar-italic')}
            {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon className="w-4 h-4" />, 'Underline', 'toolbar-underline')}

            <div className="w-px h-5 bg-gray-700 mx-1" />

            {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <span className="text-xs font-bold">H1</span>, 'Heading 1', 'toolbar-h1')}
            {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <span className="text-xs font-bold">H2</span>, 'Heading 2', 'toolbar-h2')}
            {btn(editor.isActive('heading', { level: 3 }), () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <span className="text-xs font-bold">H3</span>, 'Heading 3', 'toolbar-h3')}

            <div className="w-px h-5 bg-gray-700 mx-1" />

            {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List className="w-4 h-4" />, 'Bullet list', 'toolbar-bullet')}
            {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="w-4 h-4" />, 'Numbered list', 'toolbar-ordered')}
        </div>
    );
}

// ─── Share Modal ──────────────────────────────────────────────────────────────

function ShareModal({
    documentId,
    ownerName,
    shares,
    onClose,
    onShared,
}: {
    documentId: number;
    ownerName: string;
    shares: ShareEntry[];
    onClose: () => void;
    onShared: (share: ShareEntry) => void;
}) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleShare(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const csrfToken = getCsrfToken();

            const res = await fetch(shareAction(documentId).url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': csrfToken,
                    'X-Inertia': 'false',
                },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? data.errors?.email?.[0] ?? 'Could not share document.');
            } else {
                setEmail('');
                onShared({ name: data.name, email: data.email });
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <div className="relative z-10 bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-white">Share document</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
                </div>

                <form onSubmit={handleShare} className="mb-5">
                    <label className="block text-sm text-gray-400 mb-1.5">Email address</label>
                    <div className="flex gap-2">
                        <input
                            id="share-email-input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="demo@example.com"
                            required
                            className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                        <button
                            id="share-submit-btn"
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
                        >
                            {loading ? 'Sharing…' : 'Share'}
                        </button>
                    </div>
                    {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
                </form>

                <div>
                    <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide font-medium">People with access</p>
                    <ul className="space-y-2">
                        <li className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-semibold text-white">
                                    {ownerName[0]?.toUpperCase()}
                                </div>
                                <span className="text-sm text-white">{ownerName}</span>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Owner</span>
                        </li>
                        {shares.map((s) => (
                            <li key={s.email} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-xs font-semibold text-white">
                                        {s.name[0]?.toUpperCase()}
                                    </div>
                                    <span className="text-sm text-white">{s.name}</span>
                                </div>
                                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Editor</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
