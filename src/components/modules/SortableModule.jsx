import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ModuleCard from './ModuleCard';

const SortableModule = ({
  id,
  module,
  items,
  onEdit,
  onDelete,
  onAddItem,
  onDeleteItem,
  onEditItem,
  moduleRef,
  isExpanded,
  onToggleExpand,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  // Combine refs
  const combinedRef = node => {
    setNodeRef(node);
    if (moduleRef) {
      moduleRef(node);
    }
  };

  return (
    <div ref={combinedRef} style={style} data-module-id={module.id}>
      <ModuleCard
        module={module}
        items={items}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddItem={onAddItem}
        onDeleteItem={onDeleteItem}
        onEditItem={onEditItem}
        dragHandleProps={{ ...attributes, ...listeners }}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    </div>
  );
};

export default SortableModule;
