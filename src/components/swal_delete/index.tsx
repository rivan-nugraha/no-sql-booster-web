import Swal from "sweetalert2";

export async function SwalDelete(action: () => void) {
    const swalDeleteCondition = Swal.mixin({
        customClass: {
            confirmButton: "m-2 p-1 w-20 items-center flex justify-center text-white bg-brand-700 hover:bg-brand-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-brand-600 dark:hover:bg-brand-700 focus:outline-none dark:focus:ring-brand-800",
            cancelButton: "m-2 p-1 w-20 items-center flex justify-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm dark:bg-red-600 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800"
        },
        buttonsStyling: false
    });

    return swalDeleteCondition.fire({
        title: "Are You Sure Want To Delete This?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {
            action();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalDeleteCondition.fire({
                title: 'Failed',
                text: 'Data Not Deleted',
                icon: 'info'
            })
        }
    })
};