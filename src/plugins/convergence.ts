import { RealTimeArray, RealTimeElement, RealTimeModel, RealTimeObject, RealTimeString, StringInsertEvent, StringRemoveEvent } from "@convergence/convergence";
import { Editor, Operation, Path, TextOperation, Node } from "slate";

export interface ConvergenceEditor extends Editor {
    isRemote: boolean;
    isLocal: boolean;
}

interface SyncNode {
    text?: string;
    children?: SyncNode[];
}

export function withConvergence<T extends Editor>(editor: T, docModel: RealTimeModel): T & ConvergenceEditor {
    const convEditor = editor as T & ConvergenceEditor;
    convEditor.isLocal = false;
    convEditor.isRemote = false;

    // Set the initial value of the editor with the real time model.
    setTimeout(() => {
        Editor.withoutNormalizing(editor, () => {
            const syncedContent = docModel.elementAt('content');

            if (syncedContent.value() !== undefined) {
                const elements = (docModel.elementAt('content') as RealTimeArray).value();
                const nodes = elements.map(toSlateNode)
                editor.children = nodes;
            } else {
                // Need to set some initial content.
                // FIXME: For some reason, this is creating an empty node object.
                docModel.root().set('content', [{type: 'paragraph', children: [{text: ""}]}]);
            }

            editor.onChange();
        });
    });

    docModel.elementAt('content')
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

            convEditor.isRemote = true;

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
            let syncedRoot: RealTimeArray = docModel.elementAt('content') as RealTimeArray;
            editor.operations.reduce(applyOp, syncedRoot)
        }

        if (onChange) {
            onChange();
        }
    };

    return convEditor;
}

function toSlateNode(element: SyncNode): Node {
    const text = element.text;
    const children = element.children;
    const node: Partial<Node> = {};

    if (text) {
        node.text = text;
    }

    if (children) {
        node.children = children.map(toSlateNode);
    }

    Object.entries(element).forEach(([key, value]) => {
        if (key !== 'children' && key !== 'text') {
          node[key] = value;
        }
      });

    return node as Node;
}

function applyText(doc: RealTimeString, op: Operation): RealTimeString {
    console.log(op.path);
    if (op.type === 'insert_text') {
        doc.insert(op.offset, op.text);
    }

    if (op.type === 'remove_text') {
        doc.remove(op.offset as number, op.text.length);
    }

    return doc;
}

function applyOp(doc: RealTimeArray, op: Operation): RealTimeArray {
    switch (op.type) {
        case 'insert_text':
            // First, get the index of the node within the array.
            const node = getTargetNode(doc, op.path);
            // Then, cast it to a RealTimeString.
            const nodeText = (node as RealTimeObject).get('text') as RealTimeString;
            // Then, insert the text into the RealTimeString.
            nodeText.insert(op.offset, op.text);
            break;
        default:
            break;
    }

    return doc;
}

function getTargetNode(doc: RealTimeArray, path: Path): RealTimeElement {
    function iterate(current: RealTimeElement, index: number) {
        let children: RealTimeArray;

        if (current instanceof RealTimeArray) {
            children = current;
        } else {
            children = (current as RealTimeObject).get('children') as RealTimeArray;
        }

        return children.get(index);
    }

    return path.reduce<RealTimeElement>(iterate, doc);
}