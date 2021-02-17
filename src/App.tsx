import styled from '@emotion/styled';
import React, { useEffect, useState } from 'react';
import faker from 'faker';
import Room from './Room';

function App() {
  // const convergenceUrl = 'http://localhost:8000/api/realtime/convergence/default';
  // const [domain, setDomain] = useState<ConvergenceDomain>();
  // const [model, setModel] = useState<RealTimeModel>();
  // const [value, setValue] = useState<Node[]>([{
  //   type: 'paragraph', children: [{ text: '' }]
  // }]);
  // useEffect(() => {
  //   Convergence.connectAnonymously(convergenceUrl).then(domain => {
  //     setDomain(domain);
  //     return domain.models().openAutoCreate({
  //       collection: 'notes',
  //       id: 'test'
  //     });
  //   }).then((model: RealTimeModel) => {
  //     model.events().subscribe(e => {
  //       if (e instanceof VersionChangedEvent) {
  //         setValue(e.src.root().value().noteContent);
  //       }
  //     });
      
  //     setModel(model);
  //     setValue(model.root().value().noteContent);
  //   });

  //   return domain?.dispose();
  // }, []);
  // const editor = useMemo(() => withReact(createEditor()), []);

  // const handleChange = (newValue: Node[]) => {
  //   model?.root().set('noteContent', newValue);
  //   setValue(newValue);
  // }

  const [rooms, setRooms] = useState<string[]>([]);
  const addRoom = () => setRooms(rooms.concat(faker.lorem.slug(4)));
  const removeRoom = (room: string) => () =>
    setRooms(rooms.filter((r) => r !== room));

  useEffect(() => {
    addRoom();
  }, []);

  return (
    <div>
      <Panel>
        <AddButton type="button" onClick={addRoom}>
          Add Room
        </AddButton>
      </Panel>
      {rooms.map((room) => (
        <Room key={room} slug={room} removeRoom={removeRoom(room)} />
      ))}
    </div>
  );
}

export default App;

const Panel = styled.div`
  display: flex;
`;

const Button = styled.button`
  padding: 6px 14px;
  display: block;
  outline: none;
  font-size: 14px;
  max-width: 200px;
  text-align: center;
  color: palevioletred;
  border: 2px solid palevioletred;
`;

const AddButton = styled(Button)`
  margin-left: 0px;
  color: violet;
  margin-bottom: 10px;
  border: 2px solid violet;
`;