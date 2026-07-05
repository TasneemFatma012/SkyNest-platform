document.addEventListener("DOMContentLoaded", () => {

    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) return;

    const calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: "dayGridMonth",

        height: "auto",

        
        


        selectable: false,

        editable: false,

        eventDisplay: "block",

        headerToolbar: {
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek"
        },

        events: "/host/blocked-dates",

        dateClick: async function(info) {

            const listing = document.getElementById("listingSelect");

            if (!listing) {
                alert("Please select a listing.");
                return;
            }

            const listingId = listing.value;

            try {

                const res = await fetch("/host/block-date", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        listingId,
                        start: info.dateStr,
                        end: info.dateStr

                    })

                });

                const data = await res.json();

                if (!data.success) {
                    alert(data.message);
                    return;
                }

                alert("✅ Date blocked successfully.");

                calendar.refetchEvents();

                const modal = bootstrap.Modal.getInstance(
                    document.getElementById("blockDateModal")
                );

                if (modal) modal.hide();

            } catch (err) {

                console.log(err);

                alert("Something went wrong.");

            }

        },

       eventDidMount(info){

    const p=info.event.extendedProps;

    tippy(info.el,{

        allowHTML:true,

        animation:"shift-away",

        theme:"light-border",

        placement:"top",

        content:`

        <div class="calendar-tooltip">

            <img
            src="${p.image}"
            class="tooltip-img">

            <h6>${p.listing}</h6>

            ${
                p.type==="booking"
                ?

                `
                <p>👤 ${p.guest}</p>

                <p>💰 ₹${p.amount}</p>

                <p style="color:green">
                ✅ Confirmed
                </p>
                `

                :

                `
                <p style="color:red">
                🚫 Blocked Date
                </p>
                `
            }

        </div>

        `

    });

},eventClick: async function(info) {

    const event = info.event;

    
    if (event.extendedProps.type !== "blocked") return;

    const result = await Swal.fire({

        title: "Unblock Date?",

        html: `
            <b>${event.extendedProps.listing}</b>
            <br><br>
            This blocked date will become available for booking.
        `,

        icon: "warning",

        showCancelButton: true,

        confirmButtonText: "✅ Yes, Unblock",

        cancelButtonText: "Cancel",

        confirmButtonColor: "#16a34a",

        cancelButtonColor: "#ef4444"

    });

    if (!result.isConfirmed) return;

    try {

        const res = await fetch(`/host/block-date/${event.id}`, {

            method: "DELETE"

        });

        const data = await res.json();

        if (data.success) {

            Swal.fire({

                icon: "success",

                title: "Date Unblocked!",

                text: "The selected date is now available for booking.",

                timer: 1800,

                showConfirmButton: false

            });

            calendar.refetchEvents();

        } else {

            Swal.fire({

                icon: "error",

                title: "Oops!",

                text: data.message

            });

        }

    } catch (err) {

        console.log(err);

        Swal.fire({

            icon: "error",

            title: "Server Error",

            text: "Unable to unblock date."

        });

    }

}

    });

    calendar.render();

});