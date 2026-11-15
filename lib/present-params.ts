/**
 * The URL parameter that holds the note above the logo on /present. Shared by the server page, which
 * reads it, and the client stage, which writes it — it lives here because a value exported from a
 * `"use client"` file reaches a server component as a client reference, not as the string.
 */
export const PRESENT_NOTE_PARAM = "note"
