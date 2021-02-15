import Convergence, { ConvergenceDomain, IConvergenceEvent, RealTimeModel, VersionChangedEvent } from '@convergence/convergence';
import React, { useEffect, useMemo, useState } from 'react';
import { createEditor, Node } from 'slate';
import { Editable, Slate, withReact } from 'slate-react';
import './App.css';

function App() {
  const convergenceUrl = 'http://localhost:8000/api/realtime/convergence/default';
  const [domain, setDomain] = useState<ConvergenceDomain>();
  const [model, setModel] = useState<RealTimeModel>();
  const [value, setValue] = useState<Node[]>([{
    type: 'paragraph', children: [{ text: '' }]
  }]);
  useEffect(() => {
    Convergence.connectAnonymously(convergenceUrl).then(domain => {
      setDomain(domain);
      return domain.models().openAutoCreate({
        collection: 'notes',
        id: 'test'
      });
    }).then((model: RealTimeModel) => {
      console.log(model.root().value())
      model.events().subscribe(e => {
        if (e instanceof VersionChangedEvent) {
          setValue(e.src.root().value().noteContent);
        }
      });
      
      setModel(model);
      setValue(model.root().value().noteContent);
    });

    return domain?.dispose();
  }, []);
  const editor = useMemo(() => withReact(createEditor()), []);

  const handleChange = (newValue: Node[]) => {
    model?.root().set('noteContent', newValue);
    setValue(newValue);
  }

  return (
    <div className="App">
      <Slate
        editor={editor}
        value={value}
        onChange={handleChange}
        >
          <Editable />
        </Slate>
    </div>
  );
}

export default App;
