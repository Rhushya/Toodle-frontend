import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';

import useLocalStorage from '../../hooks/useLocalStorage';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import Header from '../ui/Header';
import Outline from '../ui/Outline';
import { useToast } from '../ui/Toast';

import LinkModal from './LinkModal';
import ModuleCard from './ModuleCard';
import ModuleModal from './ModuleModal';
import SortableItem from './SortableItem';
import SortableModule from './SortableModule';
import StandaloneItem from './StandaloneItem';
import UploadModal from './UploadModal';

const CourseBuilder = () => {
  // Persist data to localStorage
  const [modules, setModules] = useLocalStorage('courseBuilder_modules', []);
  const [items, setItems] = useLocalStorage('courseBuilder_items', []);
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notifications
  const { addToast } = useToast();

  // Modal states
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Current items for editing
  const [currentModule, setCurrentModule] = useState(null);
  const [currentModuleId, setCurrentModuleId] = useState(null);
  const [currentLink, setCurrentLink] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);

  // Outline navigation
  const [activeModuleId, setActiveModuleId] = useState(null);
  const moduleRefs = useRef({});

  // Expand/collapse all state
  const [expandedModules, setExpandedModules] = useState({});

  // Drag and drop state
  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = e => {
      // Ctrl/Cmd + N: New module
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setCurrentModule(null);
        setIsModuleModalOpen(true);
      }
      // Ctrl/Cmd + L: New link
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setCurrentModuleId(null);
        setCurrentLink(null);
        setIsLinkModalOpen(true);
      }
      // Ctrl/Cmd + U: Upload file
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        setCurrentModuleId(null);
        setCurrentFile(null);
        setIsUploadModalOpen(true);
      }
      // Escape: Close modals
      if (e.key === 'Escape') {
        setIsModuleModalOpen(false);
        setIsLinkModalOpen(false);
        setIsUploadModalOpen(false);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Intersection Observer for scroll sync
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveModuleId(entry.target.dataset.moduleId);
          }
        });
      },
      {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    Object.values(moduleRefs.current).forEach(ref => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [modules]);

  // Filter modules and items based on search query
  const getFilteredData = useCallback(() => {
    if (!searchQuery.trim()) {
      return { filteredModules: modules, filteredItems: items };
    }

    const query = searchQuery.toLowerCase();

    const matchingModuleIds = new Set(
      modules.filter(m => m.name.toLowerCase().includes(query)).map(m => m.id)
    );

    const matchingItemModuleIds = new Set(
      items
        .filter(
          item =>
            item.title.toLowerCase().includes(query) ||
            (item.url && item.url.toLowerCase().includes(query)) ||
            (item.fileName && item.fileName.toLowerCase().includes(query))
        )
        .map(item => item.moduleId)
        .filter(id => id !== null)
    );

    const visibleModuleIds = new Set([
      ...matchingModuleIds,
      ...matchingItemModuleIds,
    ]);

    const filteredModules = modules.filter(m => visibleModuleIds.has(m.id));

    const filteredItems = items.filter(item => {
      if (item.moduleId === null) {
        return (
          item.title.toLowerCase().includes(query) ||
          (item.url && item.url.toLowerCase().includes(query)) ||
          (item.fileName && item.fileName.toLowerCase().includes(query))
        );
      }
      return visibleModuleIds.has(item.moduleId);
    });

    return { filteredModules, filteredItems };
  }, [searchQuery, modules, items]);

  const { filteredModules, filteredItems } = getFilteredData();
  const standaloneItems = filteredItems.filter(item => item.moduleId === null);

  // Expand/Collapse All
  const handleExpandAll = () => {
    const expanded = {};
    modules.forEach(m => {
      expanded[m.id] = true;
    });
    setExpandedModules(expanded);
    addToast('All modules expanded', 'info');
  };

  const handleCollapseAll = () => {
    setExpandedModules({});
    addToast('All modules collapsed', 'info');
  };

  // Export course data
  const handleExportCourse = () => {
    const courseData = {
      modules,
      items: items.map(item => ({
        ...item,
        fileUrl: undefined, // Don't export file URLs as they're blob URLs
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(courseData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `course-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Course exported successfully!', 'success');
  };

  // Import course data
  const handleImportCourse = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.modules && data.items) {
              setModules(data.modules);
              setItems(data.items);
              addToast('Course imported successfully!', 'success');
            } else {
              addToast('Invalid course file format', 'error');
            }
          } catch {
            addToast('Error parsing course file', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  // Clear all data
  const handleClearAll = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Clear All Data',
      message:
        'Are you sure you want to delete all modules and resources? This cannot be undone.',
      onConfirm: () => {
        setModules([]);
        setItems([]);
        addToast('All data cleared', 'info');
      },
    });
  };

  const handleAddClick = type => {
    switch (type) {
      case 'module':
        setCurrentModule(null);
        setIsModuleModalOpen(true);
        break;
      case 'link':
        setCurrentModuleId(null);
        setCurrentLink(null);
        setIsLinkModalOpen(true);
        break;
      case 'upload':
        setCurrentModuleId(null);
        setCurrentFile(null);
        setIsUploadModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleCloseModuleModal = () => {
    setIsModuleModalOpen(false);
    setCurrentModule(null);
  };

  const handleCloseLinkModal = () => {
    setIsLinkModalOpen(false);
    setCurrentModuleId(null);
    setCurrentLink(null);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
    setCurrentModuleId(null);
    setCurrentFile(null);
  };

  const handleSaveModule = module => {
    if (currentModule) {
      setModules(modules.map(m => (m.id === module.id ? module : m)));
      addToast(`Module "${module.name}" updated`, 'success');
    } else {
      setModules([...modules, module]);
      setExpandedModules(prev => ({ ...prev, [module.id]: true }));
      addToast(`Module "${module.name}" created`, 'success');
    }
    setIsModuleModalOpen(false);
    setCurrentModule(null);
  };

  const handleEditModule = module => {
    setCurrentModule(module);
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = moduleId => {
    const module = modules.find(m => m.id === moduleId);
    const itemCount = items.filter(i => i.moduleId === moduleId).length;

    setConfirmDialog({
      isOpen: true,
      title: 'Delete Module',
      message: `Are you sure you want to delete "${module?.name}"${itemCount > 0 ? ` and its ${itemCount} item${itemCount > 1 ? 's' : ''}` : ''}?`,
      onConfirm: () => {
        setModules(modules.filter(m => m.id !== moduleId));
        setItems(items.filter(item => item.moduleId !== moduleId));
        addToast(`Module "${module?.name}" deleted`, 'success');
      },
    });
  };

  const handleAddItem = (moduleId, type) => {
    setCurrentModuleId(moduleId);
    if (type === 'link') {
      setCurrentLink(null);
      setIsLinkModalOpen(true);
    } else if (type === 'file') {
      setCurrentFile(null);
      setIsUploadModalOpen(true);
    }
  };

  const handleSaveLink = linkItem => {
    if (currentLink) {
      setItems(items.map(item => (item.id === linkItem.id ? linkItem : item)));
      addToast('Link updated', 'success');
    } else {
      setItems([...items, linkItem]);
      addToast('Link added', 'success');
    }
    setIsLinkModalOpen(false);
    setCurrentModuleId(null);
    setCurrentLink(null);
  };

  const handleSaveUpload = fileItem => {
    if (currentFile) {
      setItems(items.map(item => (item.id === fileItem.id ? fileItem : item)));
      addToast('File renamed', 'success');
    } else {
      setItems([...items, fileItem]);
      addToast('File uploaded', 'success');
    }
    setIsUploadModalOpen(false);
    setCurrentModuleId(null);
    setCurrentFile(null);
  };

  const handleDeleteItem = itemId => {
    const item = items.find(i => i.id === itemId);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Resource',
      message: `Are you sure you want to delete "${item?.title}"?`,
      onConfirm: () => {
        setItems(items.filter(i => i.id !== itemId));
        addToast('Resource deleted', 'success');
      },
    });
  };

  const handleEditItem = item => {
    if (item.type === 'link') {
      setCurrentLink(item);
      setIsLinkModalOpen(true);
    } else if (item.type === 'file') {
      setCurrentFile(item);
      setIsUploadModalOpen(true);
    }
  };

  const handleOutlineClick = moduleId => {
    const element = moduleRefs.current[moduleId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
    }
  };

  const handleSearchChange = query => {
    setSearchQuery(query);
  };

  // Drag and drop handlers
  const handleDragStart = event => {
    const { active } = event;
    const idStr = String(active.id);

    if (idStr.startsWith('module-')) {
      setActiveType('module');
      setActiveId(idStr.replace('module-', ''));
    } else if (idStr.startsWith('item-')) {
      setActiveType('item');
      setActiveId(idStr.replace('item-', ''));
    }
  };

  const handleDragEnd = event => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr.startsWith('module-') && overIdStr.startsWith('module-')) {
      const activeModuleId = activeIdStr.replace('module-', '');
      const overModuleId = overIdStr.replace('module-', '');

      if (activeModuleId !== overModuleId) {
        setModules(modules => {
          const oldIndex = modules.findIndex(m => m.id === activeModuleId);
          const newIndex = modules.findIndex(m => m.id === overModuleId);
          return arrayMove(modules, oldIndex, newIndex);
        });
        addToast('Module reordered', 'info');
      }
    }

    if (activeIdStr.startsWith('item-')) {
      const activeItemId = activeIdStr.replace('item-', '');
      const activeItem = items.find(item => item.id === activeItemId);

      if (!activeItem) {
        setActiveId(null);
        setActiveType(null);
        return;
      }

      if (overIdStr.startsWith('item-')) {
        const overItemId = overIdStr.replace('item-', '');
        const overItem = items.find(item => item.id === overItemId);

        if (overItem && activeItemId !== overItemId) {
          setItems(items => {
            const targetModuleId = overItem.moduleId;
            const targetModuleItems = items.filter(
              i => i.moduleId === targetModuleId
            );
            const otherItems = items.filter(i => i.moduleId !== targetModuleId);

            const filteredTargetItems = targetModuleItems.filter(
              i => i.id !== activeItemId
            );
            const newActiveItem = { ...activeItem, moduleId: targetModuleId };

            const overIndex = filteredTargetItems.findIndex(
              i => i.id === overItemId
            );
            filteredTargetItems.splice(overIndex, 0, newActiveItem);

            const cleanedOtherItems = otherItems.filter(
              i => i.id !== activeItemId
            );

            return [...cleanedOtherItems, ...filteredTargetItems];
          });
          addToast('Resource moved', 'info');
        }
      }

      if (overIdStr.startsWith('module-')) {
        const targetModuleId = overIdStr.replace('module-', '');
        if (activeItem.moduleId !== targetModuleId) {
          setItems(items =>
            items.map(item =>
              item.id === activeItemId
                ? { ...item, moduleId: targetModuleId }
                : item
            )
          );
          addToast('Resource moved to module', 'info');
        }
      }
    }

    setActiveId(null);
    setActiveType(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setActiveType(null);
  };

  const isEmpty = modules.length === 0 && items.length === 0;
  const hasContent = filteredModules.length > 0 || standaloneItems.length > 0;

  const activeModule =
    activeType === 'module' ? modules.find(m => m.id === activeId) : null;
  const activeItem =
    activeType === 'item' ? items.find(i => i.id === activeId) : null;

  const moduleIds = filteredModules.map(m => `module-${m.id}`);
  const standaloneItemIds = standaloneItems.map(i => `item-${i.id}`);
  const allSortableIds = [...standaloneItemIds, ...moduleIds];

  return (
    <div className="course-builder">
      <Header
        onAddClick={handleAddClick}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        onExport={handleExportCourse}
        onImport={handleImportCourse}
        onClearAll={handleClearAll}
        moduleCount={modules.length}
        itemCount={items.length}
      />

      <div className="builder-layout">
        {modules.length > 0 && (
          <Outline
            modules={modules}
            activeModuleId={activeModuleId}
            onModuleClick={handleOutlineClick}
          />
        )}

        <div className="builder-content">
          {isEmpty ? (
            <EmptyState />
          ) : !hasContent && searchQuery ? (
            <div className="no-results">
              <p>No results found for &quot;{searchQuery}&quot;</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={allSortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div className="content-list">
                  {standaloneItems.map(item => (
                    <SortableItem
                      key={item.id}
                      id={`item-${item.id}`}
                      item={item}
                      onDelete={handleDeleteItem}
                      onEdit={handleEditItem}
                    />
                  ))}

                  {filteredModules.map(module => (
                    <SortableModule
                      key={module.id}
                      id={`module-${module.id}`}
                      module={module}
                      items={filteredItems}
                      onEdit={handleEditModule}
                      onDelete={handleDeleteModule}
                      onAddItem={handleAddItem}
                      onDeleteItem={handleDeleteItem}
                      onEditItem={handleEditItem}
                      moduleRef={el => (moduleRefs.current[module.id] = el)}
                      isExpanded={expandedModules[module.id] !== false}
                      onToggleExpand={expanded =>
                        setExpandedModules(prev => ({
                          ...prev,
                          [module.id]: expanded,
                        }))
                      }
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeModule ? (
                  <div className="drag-overlay">
                    <ModuleCard
                      module={activeModule}
                      items={items}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onAddItem={() => {}}
                      onDeleteItem={() => {}}
                      onEditItem={() => {}}
                    />
                  </div>
                ) : null}
                {activeItem ? (
                  <div className="drag-overlay">
                    <StandaloneItem
                      item={activeItem}
                      onDelete={() => {}}
                      onEdit={() => {}}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </div>

      {/* Module Modal */}
      <ModuleModal
        isOpen={isModuleModalOpen}
        onClose={handleCloseModuleModal}
        onSave={handleSaveModule}
        module={currentModule}
      />

      {/* Link Modal */}
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={handleCloseLinkModal}
        onSave={handleSaveLink}
        moduleId={currentModuleId}
        link={currentLink}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onSave={handleSaveUpload}
        moduleId={currentModuleId}
        file={currentFile}
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </div>
  );
};

export default CourseBuilder;
