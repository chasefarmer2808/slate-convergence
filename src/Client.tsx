import Convergence, { ConvergenceDomain, RealTimeModel, VersionChangedEvent } from "@convergence/convergence";
import styled from "@emotion/styled";
import React, { useEffect, useMemo, useState } from "react";
import { createEditor, Node } from "slate";
import { withHistory } from "slate-history";
import { ReactEditor, withReact } from "slate-react";
import { Button, H4, Instance, Title } from "./Components";
import EditorFrame from "./EditorFrame";
import { withConvergence } from "./plugins/convergence";
import { withLinks } from "./plugins/link";

interface ClientProps {
  name: string;
  id: string;
  slug: string;
  removeUser: (id: any) => void;
}

const CONVERGENCE_URL = 'http://localhost:8000/api/realtime/convergence/default';

const Client: React.FC<ClientProps> = ({ id, name, slug, removeUser }) => {
  const [value, setValue] = useState<Node[]>([
    { type: 'paragraph', children: [{ text: '' }]}
  ]);
  const [isOnline, setOnlineState] = useState<boolean>(false);
  const [docModel, setDocModel] = useState<RealTimeModel>();

  useEffect(() => {
    let convergeDomain: ConvergenceDomain;
    Convergence.connectAnonymously(CONVERGENCE_URL).then(domain => {
      convergeDomain = domain;
      return domain.models().openAutoCreate({
        collection: 'notes',
        id: 'test'
      });
    }).then((model: RealTimeModel) => {
      setDocModel(model);
      // setValue(model.root().value().noteContent);
    });

    return () => convergeDomain?.dispose();
  }, []);

  const editor = useMemo(() => {
    if (docModel !== undefined) {
      return withConvergence(withLinks(withReact(withHistory(createEditor()))), docModel);
    }
  }, [docModel]);

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
      {editor ? (<EditorFrame
        editor={editor}
        value={value}
        onChange={(value: Node[]) => setValue(value)}
      />) : ""}
    </Instance>
  );
};

export default Client;

const Head = styled(H4)`
  margin-right: auto;
`;