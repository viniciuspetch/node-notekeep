class Note {
    constructor(noteController, content, tags, datetime) {
        this.id = noteController.nextCreatedId;
        this.content = content;
        this.tags = tags;
        this.datetime = datetime;

        noteController.lastCreatedId = noteController.nextCreatedId;
        noteController.nextCreatedId++;
    }
}

module.exports = Note;