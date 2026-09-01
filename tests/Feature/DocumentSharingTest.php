<?php

use App\Models\Document;
use App\Models\User;

beforeEach(function () {
    $this->owner = User::factory()->create();
    $this->sharedUser = User::factory()->create();
    $this->unrelatedUser = User::factory()->create();

    $this->document = Document::create([
        'user_id' => $this->owner->id,
        'title' => 'Project Proposal',
        'content' => '<p>Hello world</p>',
    ]);
});

it('allows owner to view their own document', function () {
    $this->actingAs($this->owner)
        ->get("/documents/{$this->document->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('documents/show')
            ->where('isOwner', true)
        );
});

it('allows shared user to read a document shared with them', function () {
    $this->document->shares()->create([
        'user_id' => $this->sharedUser->id,
        'shared_by' => $this->owner->id,
    ]);

    $this->actingAs($this->sharedUser)
        ->get("/documents/{$this->document->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('documents/show')
            ->where('isOwner', false)
        );
});

it('prevents an unrelated user from accessing a document', function () {
    $this->actingAs($this->unrelatedUser)
        ->get("/documents/{$this->document->id}")
        ->assertForbidden();
});

it('allows shared user to update a document shared with them', function () {
    $this->document->shares()->create([
        'user_id' => $this->sharedUser->id,
        'shared_by' => $this->owner->id,
    ]);

    $this->actingAs($this->sharedUser)
        ->put("/documents/{$this->document->id}", [
            'title' => 'Updated Title',
            'content' => '<p>Updated content</p>',
        ])
        ->assertOk();

    expect($this->document->fresh()->title)->toBe('Updated Title');
});

it('prevents unrelated user from updating a document', function () {
    $this->actingAs($this->unrelatedUser)
        ->put("/documents/{$this->document->id}", ['title' => 'Hacked'])
        ->assertForbidden();
});

it('persists document content after save', function () {
    $content = '<p><strong>Bold text</strong> and <em>italic</em></p>';

    $this->actingAs($this->owner)
        ->put("/documents/{$this->document->id}", [
            'title' => 'My Document',
            'content' => $content,
        ])
        ->assertOk();

    $this->actingAs($this->owner)
        ->get("/documents/{$this->document->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('document.title', 'My Document')
            ->where('document.content', $content)
        );
});

it('only allows owner to share a document', function () {
    $this->actingAs($this->sharedUser)
        ->post("/documents/{$this->document->id}/share", [
            'email' => $this->unrelatedUser->email,
        ])
        ->assertForbidden();
});

it('owner can share document with another user', function () {
    $this->actingAs($this->owner)
        ->post("/documents/{$this->document->id}/share", [
            'email' => $this->sharedUser->email,
        ])
        ->assertOk();

    expect($this->document->shares()->where('user_id', $this->sharedUser->id)->exists())->toBeTrue();
});
