import React, { useState } from 'react';
import { Modal, Button } from 'antd'; // Assuming you're using Ant Design

const DeleteConfirmationModal = ({
  id,
  itemName,
  onConfirm,
  loading,
  children
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
      setIsModalOpen(false);
    await onConfirm(id);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <span onClick={showModal}>
        {children}
      </span>
      
      <Modal
        title="Confirm Delete"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            danger
            loading={loading === `deleting-${id}`}
            onClick={handleOk}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete <b>{itemName} ?</b></p>
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default DeleteConfirmationModal;