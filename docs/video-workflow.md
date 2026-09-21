# Project media workflow

Primary source: a user-supplied MP4/WebM, maximum 25 MB. File policy runs on client and server. Upload initiation and Blob callbacks bind an asset identity; project save attaches only an eligible owned asset.

Images post to /api/upload/image for Sharp compression. Videos use /api/upload/initiate then the Vercel Blob client and /api/upload token/callback handler. A successful transfer is not equivalent to a saved project.

The project form retains one URL state and one asset ID. Selecting a file replaces the source after upload succeeds. Entering an external URL clears the asset association. Collapsing Advanced / Legacy must never clear or disable hidden submitted fields.

Legacy providers:
- YouTube and Drive: provider embeds, subject to their own UI and availability.
- Pinterest and other HTTP(S) pages: resolver-defined external fallback when embedding is unsupported.
- Direct MP4/WebM: native custom player.

Cards use centered cover artwork; the full player uses contain. A portrait clip in a landscape viewport necessarily leaves side space. Do not stretch or crop playback to remove that space.

Verify both new and existing projects: typing, replacement, failed-save retention, save/reopen, source replacement, orientation and banner ratio. Test real Blob delivery only with a dedicated staging store and disposable records.
