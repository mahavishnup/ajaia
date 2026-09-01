<?php

namespace App\Http\Controllers;

use App\Models\Document;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    /** GET /documents — list owned + shared */
    public function index(): Response
    {
        $user = Auth::user();

        $ownedDocuments = Document::where('user_id', $user->id)
            ->orderByDesc('updated_at')
            ->get(['id', 'title', 'updated_at']);

        $sharedDocuments = Document::whereHas('shares', fn ($q) => $q->where('user_id', $user->id))
            ->with(['owner:id,name'])
            ->orderByDesc('updated_at')
            ->get(['id', 'user_id', 'title', 'updated_at']);

        return Inertia::render('documents/index', [
            'ownedDocuments' => $ownedDocuments,
            'sharedDocuments' => $sharedDocuments,
        ]);
    }

    /** POST /documents — create new */
    public function store(Request $request): RedirectResponse
    {
        $document = Document::create([
            'user_id' => Auth::id(),
            'title' => 'Untitled document',
            'content' => '',
        ]);

        return redirect()->route('documents.show', $document);
    }

    /** GET /documents/{document} — open editor */
    public function show(Document $document): Response
    {
        $this->authorizeAccess($document);

        $user = Auth::user();
        $isOwner = $document->isOwnedBy($user);

        $shares = $document->shares()->with('user:id,name,email')->get()->map(fn ($share) => [
            'name' => $share->user->name,
            'email' => $share->user->email,
        ]);

        return Inertia::render('documents/show', [
            'document' => $document,
            'isOwner' => $isOwner,
            'shares' => $shares,
            'ownerName' => $document->owner->name,
        ]);
    }

    /** PUT /documents/{document} — save title + content */
    public function update(Request $request, Document $document): JsonResponse
    {
        $this->authorizeAccess($document);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string'],
        ]);

        $document->update($data);

        return response()->json(['updated_at' => $document->updated_at]);
    }

    /** DELETE /documents/{document} — owner only */
    public function destroy(Document $document): RedirectResponse
    {
        $this->authorizeOwner($document);

        $document->delete();

        return redirect()->route('documents.index');
    }

    /** POST /documents/{document}/share — share with user by email */
    public function share(Request $request, Document $document): JsonResponse
    {
        $this->authorizeOwner($document);

        $data = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $targetUser = User::where('email', $data['email'])->first();

        if ($targetUser->id === Auth::id()) {
            return response()->json(['message' => 'You cannot share a document with yourself.'], 422);
        }

        if ($document->isSharedWith($targetUser)) {
            return response()->json(['message' => 'Document already shared with this user.'], 422);
        }

        $document->shares()->create([
            'user_id' => $targetUser->id,
            'shared_by' => Auth::id(),
        ]);

        return response()->json([
            'name' => $targetUser->name,
            'email' => $targetUser->email,
        ]);
    }

    /** POST /documents/import — upload .txt or .md */
    public function import(Request $request): RedirectResponse
    {
        if (!$request->hasFile('file')) {
            \Log::error('Upload failed: No file was found in the request. PHP may have discarded the POST data due to temp directory permissions.');
            return back()->withErrors(['file' => 'Upload failed: No file was received by the server.']);
        }

        $file = $request->file('file');
        
        if (!$file->isValid()) {
            \Log::error('Upload failed. Error code: ' . $file->getError() . ' - Message: ' . $file->getErrorMessage());
            return back()->withErrors(['file' => 'Upload failed: ' . $file->getErrorMessage()]);
        }

        $request->validate([
            'file' => [
                'required',
                'file',
                'max:5120',
                function ($attribute, $value, $fail) {
                    $extension = strtolower($value->getClientOriginalExtension());
                    if (! in_array($extension, ['txt', 'md'])) {
                        $fail('Only .txt and .md files are supported.');
                    }
                },
            ],
        ]);

        $file = $request->file('file');
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        $content = file_get_contents($file->getRealPath());

        // Wrap plain text in a basic paragraph tag so TipTap can render it
        $htmlContent = '<p>'.nl2br(e($content)).'</p>';

        $document = Document::create([
            'user_id' => Auth::id(),
            'title' => Str::limit($originalName, 200),
            'content' => $htmlContent,
        ]);

        return redirect()->route('documents.show', $document);
    }

    private function authorizeAccess(Document $document): void
    {
        if (! $document->isAccessibleBy(Auth::user())) {
            abort(403, 'You do not have access to this document.');
        }
    }

    private function authorizeOwner(Document $document): void
    {
        if (! $document->isOwnedBy(Auth::user())) {
            abort(403, 'Only the document owner can perform this action.');
        }
    }
}
