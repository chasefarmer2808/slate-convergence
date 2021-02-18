import { IConvergenceEvent, ModelService, RealTimeArray, RealTimeElement, RealTimeModel, RealTimeString, StringInsertEvent, StringRemoveEvent, VersionChangedEvent } from "@convergence/convergence";
import { Editor, Operation, Path, TextOperation, Transforms } from "slate";
import { ReactEditor } from "slate-react";

export interface ConvergenceEditor extends Editor {
    isRemote: boolean;
    isLocal: boolean;
}

export function withConvergence<T extends Editor>(editor: T, docModel: RealTimeModel): T & ConvergenceEditor {
    const convEditor = editor as T & ConvergenceEditor;
    convEditor.isLocal = false;
    convEditor.isRemote = false;

    docModel.elementAt('note')
        .on(StringInsertEvent.NAME, e => {
            if (convEditor.isLocal) {
                return;
            }

            convEditor.isRemote = true;

            const insertEvent = e as StringInsertEvent

            const insertTextOp: TextOperation = {
                type: 'insert_text',
                offset: insertEvent.index,
                text: insertEvent.value,
                path: [0, 0]
            }
            editor.apply(insertTextOp);
        })
        .on(StringRemoveEvent.NAME, e => {
            if (convEditor.isLocal) {
                return;
            }

            const removeEvent = e as StringRemoveEvent;

            const removeTextOp: TextOperation = {
                type: 'remove_text',
                offset: removeEvent.index,
                text: removeEvent.value,
                path: [0, 0]
            }
            editor.apply(removeTextOp);
        });

    const { onChange } = editor;

    editor.onChange = () => {
        if (!convEditor.isRemote) {
            convEditor.isLocal = true;

            let syncedNote: RealTimeString = docModel.elementAt('note') as RealTimeString;

            if (syncedNote.value() === undefined) {
                console.log('here')
                docModel.root().set('note', '');
                syncedNote = docModel.elementAt('note') as RealTimeString;
            }
    
            editor.operations.reduce(applyText, syncedNote)
        }

        if (onChange) {
            onChange();
        }
    };

    return convEditor;
}

function applyText(doc: RealTimeString, op: Operation): RealTimeString {
    console.log(op)
    if (op.type === 'insert_text') {
        doc.insert(op.offset, op.text);
    }

    if (op.type === 'remove_text') {
        doc.remove(op.offset as number, op.text.length);
    }

    return doc;
}