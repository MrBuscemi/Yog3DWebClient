import { useBackend } from '../backend';
import { Button, Section } from '../components';
import { Window } from '../layouts';

export const WebclientContextMenu = (props, context) => {
  const { act, data } = useBackend(context);
  const targetName = data.target_name || 'Nothing';
  const actions = data.actions || [];
  return (
    <Window
      width={200}
      height={30 + actions.length * 28}>
      <Window.Content>
        <Section title={targetName}>
          {actions.map(action => (
            <Button
              key={action.action}
              fluid
              content={action.name}
              onClick={() => act(action.action)} />
          ))}
        </Section>
      </Window.Content>
    </Window>
  );
};
