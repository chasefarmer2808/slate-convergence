import Convergence, {
  ConvergenceDomain,
  RealTimeModel,
} from "@convergence/convergence";
import faker from "faker";
import debounce from "lodash/debounce";
import React, { ChangeEvent, useEffect, useState } from "react";
import Client from "./Client";
import { Button, Grid, H4, Input, RoomWrapper, Title } from "./Components";

interface User {
  id: string;
  name: string;
}

interface RoomProps {
  slug: string;
  removeRoom: () => void;
}

const createUser = (): User => ({
  id: faker.random.uuid(),
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
});

const CONVERGENCE_URL =
  "http://localhost:8000/api/realtime/convergence/default";

const Room: React.FC<RoomProps> = ({ slug, removeRoom }) => {
  const [users, setUsers] = useState<User[]>([createUser(), createUser()]);
  const [roomSlug, setRoomSlug] = useState<string>(slug);
  const [isRemounted, setRemountState] = useState(false);
  const [docModel, setDocModel] = useState<RealTimeModel>();

  useEffect(() => {
    let convergeDomain: ConvergenceDomain;
    Convergence.connectAnonymously(CONVERGENCE_URL)
      .then((domain) => {
        convergeDomain = domain;
        return domain.models().openAutoCreate({
          collection: "notes",
          id: "test",
          data: {
            content: [{ type: "paragraph", children: [{ text: "" }] }],
          },
        });
      })
      .then((model: RealTimeModel) => {
        setDocModel(model);
      });

    return () => {
      docModel?.close().then(() => {
        convergeDomain?.dispose();
      });
    };
  }, []);

  const remount = debounce(() => {
    setRemountState(true);
    setTimeout(setRemountState, 50, false);
  }, 300);

  const changeSlug = (e: ChangeEvent<HTMLInputElement>) => {
    setRoomSlug(e.target.value);
    remount();
  };

  const addUser = () => setUsers((users) => users.concat(createUser()));

  const removeUser = (userId: string) =>
    setUsers((users) => users.filter((u: User) => u.id !== userId));

  return (
    <RoomWrapper>
      <Title>
        <H4>Document slug:</H4>
        <Input type="text" value={roomSlug} onChange={changeSlug} />
        <Button type="button" onClick={addUser}>
          Add random user
        </Button>
        <Button type="button" onClick={removeRoom}>
          Remove Room
        </Button>
      </Title>
      <Grid>
        {users.map((user: User) =>
          isRemounted ? null : docModel ? (
            <Client
              {...user}
              slug={roomSlug}
              key={user.id}
              docModel={docModel}
              removeUser={removeUser}
            />
          ) : null
        )}
      </Grid>
    </RoomWrapper>
  );
};

export default Room;
