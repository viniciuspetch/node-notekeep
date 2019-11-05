# node-notekeeper
Simple notekeeper website/API made with HTML, Node.js and SQLite

## API Commands
- /api/create [POST]: Create a note. Receives the body of the note "content" and the list of tags "tags". Returns a JSON with {status: OK} if no error occurs;
- /api/read [GET]: List of all notes. Returns a JSON with all notes;
- /api/read/:id [GET]: A single note. Receives a ID "id". Returns a JSON with a single note;
- /api/edit [POST]: Edits a single note. Receives the ID "id", body of the note "content", and the list of tags "tags". Returns a JSON with {status: OK} if no error occurs;
- /api/delete/:id [GET]: Deletes a note. Receices the ID "id". Returns a JSON with {status: OK} if no error occurs;
