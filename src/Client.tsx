import Convergence, { RealTimeModel } from "@convergence/convergence";
import styled from "@emotion/styled";
import React, { useMemo, useRef, useState } from "react";
import { createEditor, Node } from "slate";
import { withHistory } from "slate-history";
import { ReactEditor, withReact } from "slate-react";
import { Button, H4, Instance, Title } from "./Components";
import EditorFrame from "./EditorFrame";
// @refresh reset

import { withConvergence } from "./plugins/convergence";
import { withLinks } from "./plugins/link";

interface ClientProps {
  name: string;
  id: string;
  slug: string;
  docModel: RealTimeModel;
  removeUser: (id: any) => void;
}

const Client: React.FC<ClientProps> = ({
  id,
  name,
  slug,
  docModel,
  removeUser,
}) => {
  const [value, setValue] = useState<Node[]>([
    {
      type: "paragraph",
      children: [{ text: "" }],
    },
  ]);
  const [isOnline, setOnlineState] = useState<boolean>(false);
  const editor = useMemo<ReactEditor>(() => {
    return withConvergence(withLinks(withReact(withHistory(createEditor()))), docModel);
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
      <EditorFrame
        editor={editor}
        value={value}
        onChange={(value: Node[]) => setValue(value)}
      />
    </Instance>
  );
};

export default Client;

const Head = styled(H4)`
  margin-right: auto;
`;
