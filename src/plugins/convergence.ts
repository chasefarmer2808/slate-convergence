import Convergence, { ModelChangedEvent, RealTimeArray, RealTimeElement, RealTimeModel, RealTimeObject, RealTimeString, StringInsertEvent, StringRemoveEvent } from "@convergence/convergence";
import { Editor, Operation, Path, TextOperation, Node } from "slate";

export interface ConvergenceEditor extends Editor {
    doc: RealTimeArray;
    ops: RealTimeArray;
    isRemote: boolean;
    isLocal: boolean;
}

interface SyncNode {
    text?: string;
    children?: SyncNode[];
}

export function withConvergence<T extends Editor>(editor: T, docModel: RealTimeModel): T & ConvergenceEditor {
    console.log('here')
    const convEditor = editor as T & ConvergenceEditor;
    convEditor.doc = docModel.elementAt('content') as RealTimeArray;
    convEditor.ops = docModel.elementAt('ops') as RealTimeArray;
    convEditor.isLocal = false;
    convEditor.isRemote = false;

    // Set the initial value of the editor with the real time model.
    const initialOps = convEditor.ops.value() as Operation[];


    console.log('done initing')
    // setTimeout(() => {
    //     Editor.withoutNormalizing(editor, () => {
    //        convEditor.ops.forEach(op => {
    //            editor.apply(op.value());
    //        });
    //     });
    // });

    const { onChange } = editor;

    editor.onChange = () => {
        if (!convEditor.isRemote) {
            convEditor.isLocal = true;
            // editor.operations.reduce(applyOp, convEditor.doc)
            editor.operations.forEach(op => {
                console.log(op)
                convEditor.ops.push(op)
            });
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

    if (text !== undefined) {
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