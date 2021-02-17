import { ModelService, RealTimeArray, RealTimeElement, RealTimeModel, VersionChangedEvent } from "@convergence/convergence";
import { Operation } from "slate";
import { ReactEditor } from "slate-react";

export function withConvergence(editor: ReactEditor, docModel: RealTimeModel): ReactEditor {
    docModel.events().subscribe(e => {
        if (e instanceof VersionChangedEvent) {
            console.log(e.src.root().value());
        }
    });
    
    const { onChange } = editor;

    editor.onChange = () => {
        console.log(editor.operations)
        // docModel.root().set('noteContent', editor.children);
        const operations: RealTimeArray = docModel.elementAt('operations') as RealTimeArray;

        if (operations.value() === undefined) {
            // First time editing the document, so init the real time array.
            docModel.root().set('operations', editor.operations);
        } else {
            // Operations already exist from other clients, so append to that real time array.
            operations.insert(operations.value().length - 1, editor.operations);
        }

        if (onChange) {
            onChange();
        }
    };

    return editor;
}