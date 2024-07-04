import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

interface DeleteRowDialogProps {
  visible: boolean;
  onHide: () => void;
  onDelete: () => void;
}

const DeleteRowDialog: React.FC<DeleteRowDialogProps> = ({
  visible,
  onHide,
  onDelete,
}) => {
  const footer = (
    <>
      <Button label="No" icon="pi pi-times" outlined onClick={onHide} />
      <Button
        label="Yes"
        icon="pi pi-check"
        severity="danger"
        onClick={onDelete}
      />
    </>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "32rem" }}
      breakpoints={{ "960px": "75vw", "641px": "90vw" }}
      header="Confirm"
      modal
      footer={footer}
      onHide={onHide}
    >
      <div className="confirmation-content">
        <i
          className="pi pi-exclamation-triangle mr-3"
          style={{ fontSize: "2rem" }}
        />
        <span>Are you sure you want to delete this row?</span>
      </div>
    </Dialog>
  );
};

export default DeleteRowDialog;
