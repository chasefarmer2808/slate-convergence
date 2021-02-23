import Convergence, {
  ConvergenceDomain,
  RealTimeModel,
  VersionChangedEvent,
} from "@convergence/convergence";
import styled from "@emotion/styled";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createEditor, Editor, Node } from "slate";
import { withHistory } from "slate-history";
import { ReactEditor, withReact } from "slate-react";
import { Button, H4, Instance, Title } from "./Components";
import EditorFrame from "./EditorFrame";
import { ConvergenceEditor, withConvergence } from "./plugins/convergence";
import { withLinks } from "./plugins/link";

interface ClientProps {
  name: string;
  id: string;
  slug: string;
  removeUser: (id: any) => void;
}

const CONVERGENCE_URL =
  "http://localhost:8000/api/realtime/convergence/default";

const Client: React.FC<ClientProps> = ({ id, name, slug, removeUser }) => {
  // const editorRef = useRef<ReactEditor>();
  const [editor, setEditor] = useState<ReactEditor>();
  const [value, setValue] = useState<Node[]>([
    { type: "paragraph", children: [{ text: "" }] },
  ]);
  const [isOnline, setOnlineState] = useState<boolean>(false);
  const [docModel, setDocModel] = useState<RealTimeModel>();

  useEffect(() => {
    let convergeDomain: ConvergenceDomain;
    Convergence.connectAnonymously(CONVERGENCE_URL)
      .then((domain) => {
        convergeDomain = domain;
        return domain.models().openAutoCreate({
          collection: "notes",
          id: "test",
          ephemeral: true,
        });
      })
      .then((model: RealTimeModel) => {
        setDocModel(model);

        setEditor(withConvergence(
          withLinks(withReact(withHistory(createEditor()))),
          model
        ));

        // if (model.elementAt("note").value() !== undefined) {
        //   setValue([
        //     {
        //       type: "paragraph",
        //       children: [{ text: model.elementAt("note").value() }],
        //     },
        //   ]);
        // }
        // TODO: Initialize editor content.
      });

    return () => convergeDomain?.dispose();
  }, []);

  // TODO
  const toggleOnline = () => {};

  return (
    <Instance online={isOnline}>
      <Title>
        <Head>Editor: {name}</Head>
        <div style={{ display: "flex", marginTop: 10, marginBottom: 10 }}>
          <Button type="button" onClick={toggleOnline}>
            Go {isOnline ? "offline" : "online"}
          </Button>
          <Button type="button" onClick={() => removeUser(id)}>
            Remove
          </Button>
        </div>
      </Title>
      {editor ? (
        <EditorFrame
          editor={editor}
          value={value}
          onChange={(value: Node[]) => setValue(value)}
        />
      ) : (
        ""
      )}
    </Instance>
  );
};

export default Client;

const Head = styled(H4)`
  margin-right: auto;
`;
