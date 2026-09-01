import { Head, Link, router } from '@inertiajs/react';
import { FileText, FolderOpen, Plus, Share2, Upload } from 'lucide-react';
import { useRef } from 'react';
import { store, destroy, importMethod } from '@/actions/App/Http/Controllers/DocumentController';
import type { Document } from '@/types';

interface Props {
    ownedDocuments: Document[];
    sharedDocuments: Document[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function DocumentsIndex({ ownedDocuments, sharedDocuments }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    // const { post: postForm, processing } = useForm<{ file: File | null }>({ file: null });

    function handleCreate() {
        router.post(store().url);
    }

    function handleDelete(id: number) {
        if (confirm('Delete this document?')) {
            router.delete(destroy({ document: id }).url);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        router.post(importMethod().url, formData as any, { 
            forceFormData: true,
            onError: (errors) => {
                alert('Import failed: ' + Object.values(errors).join('\n'));
            }
        });
        e.target.value = '';
    }

    return (
        <>
            <Head title="My Documents — Ajaia Docs" />

            <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
                {/* Top Nav */}
                <header className="h-14 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-900/80 backdrop-blur sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <span className="font-semibold text-white tracking-tight">Ajaia Docs</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".txt,.md"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-gray-800 hover:bg-gray-700 transition-colors border border-gray-700 text-gray-300 hover:text-white"
                        >
                            <Upload className="w-4 h-4" />
                            Import .txt / .md
                        </button>
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-blue-600 hover:bg-blue-500 transition-colors text-white font-medium"
                        >
                            <Plus className="w-4 h-4" />
                            New document
                        </button>
                        <Link
                            href="/settings/profile"
                            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                        >
                            M
                        </Link>
                    </div>
                </header>

                <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
                    {/* My Documents */}
                    <section className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <FolderOpen className="w-5 h-5 text-blue-400" />
                            <h2 className="text-lg font-semibold text-white">My Documents</h2>
                            <span className="ml-1 text-sm text-gray-500">({ownedDocuments.length})</span>
                        </div>

                        {ownedDocuments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-700 p-12 text-center text-gray-500">
                                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                                <p className="text-sm">No documents yet.</p>
                                <button
                                    onClick={handleCreate}
                                    className="mt-3 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                                >
                                    Create your first document →
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {ownedDocuments.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        doc={doc}
                                        onDelete={() => handleDelete(doc.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Shared with me */}
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <Share2 className="w-5 h-5 text-purple-400" />
                            <h2 className="text-lg font-semibold text-white">Shared with me</h2>
                            <span className="ml-1 text-sm text-gray-500">({sharedDocuments.length})</span>
                        </div>

                        {sharedDocuments.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-700 p-8 text-center text-gray-500">
                                <p className="text-sm">No documents shared with you yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {sharedDocuments.map((doc) => (
                                    <DocumentCard
                                        key={doc.id}
                                        doc={doc}
                                        isShared
                                        ownerName={doc.owner?.name}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </>
    );
}

function DocumentCard({
    doc,
    isShared = false,
    ownerName,
    onDelete,
}: {
    doc: Document;
    isShared?: boolean;
    ownerName?: string;
    onDelete?: () => void;
}) {
    return (
        <Link
            href={`/documents/${doc.id}`}
            className="group block rounded-xl border border-gray-800 bg-gray-900 hover:border-blue-600/60 hover:bg-gray-800/60 transition-all p-5 relative"
        >
            <div className="flex items-start justify-between mb-3">
                <FileText className={`w-8 h-8 ${isShared ? 'text-purple-400' : 'text-blue-400'}`} />
                {isShared && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-800/50">
                        Shared
                    </span>
                )}
                {!isShared && onDelete && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onDelete();
                        }}
                        className="opacity-0 group-hover:opacity-100 text-xs text-gray-500 hover:text-red-400 transition-all"
                    >
                        Delete
                    </button>
                )}
            </div>
            <h3 className="font-medium text-white text-sm mb-1 truncate">
                {doc.title || 'Untitled document'}
            </h3>
            <p className="text-xs text-gray-500">
                {isShared ? `By ${ownerName ?? 'Unknown'}` : `Edited ${formatDate(doc.updated_at)}`}
            </p>
        </Link>
    );
}
