import Convergence, {
  ConvergenceDomain,
  RealTimeModel,
  VersionChangedEvent,
} from "@convergence/convergence";
import styled from "@emotion/styled";
import { create } from "lodash";
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
  const editor = useRef<ReactEditor>(
    withConvergence(withLinks(withReact(withHistory(createEditor()))), docModel)
  );
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
        editor={editor.current}
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
