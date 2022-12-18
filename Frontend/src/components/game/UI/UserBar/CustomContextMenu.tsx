import * as React from 'react';
import { ListGroup } from 'react-bootstrap';
import { motion } from "framer-motion";

type ContextMenuProps = {
  // Props for the context menu
  children: React.ReactNode;
  elements: { text: string, onClick: () => void }[]
}

const MotionListItem = motion(ListGroup.Item);

export const ContextMenu: React.FC<ContextMenuProps> = (props: ContextMenuProps) => {
  const [isContextMenuVisible, setIsContextMenuVisible] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  const menuRef = React.useRef<HTMLDivElement>(null);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();

    setIsContextMenuVisible(e => !e);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const hideContextMenu = () => {
    setIsContextMenuVisible(false);
  };

  React.useEffect(() => {
    document.addEventListener('click', hideContextMenu);
    document.addEventListener('scroll', hideContextMenu);

    return () => {
      document.removeEventListener('click', hideContextMenu);
      document.removeEventListener('scroll', hideContextMenu);
    };
  }, []);

  // Render the context menu component
  return (
    <div onContextMenu={handleContextMenu} onMouseLeave={() => { setIsContextMenuVisible(false); }}>
      {props.children}
      <div

        ref={menuRef}
        style={{
          zIndex: 1001,
          position: 'absolute',
          top: contextMenuPosition.y,
          left: contextMenuPosition.x,
          visibility: isContextMenuVisible ? 'visible' : 'hidden',
        }}
      >
        <ListGroup>
          {
            props.elements.map(e =>
              <MotionListItem whileHover={{ filter: "brightness(70%)" }} onClick={e.onClick} key={e.text}>
                {e.text}
              </MotionListItem>
            )
          }
        </ListGroup>
      </div>
    </div>
  );
};

