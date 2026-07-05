document.addEventListener("DOMContentLoaded", () => {

    const revenueCanvas = document.getElementById("revenueChart");
    const bookingCanvas = document.getElementById("bookingChart");

    const labels = window.dashboardData.chartLabels;
    const revenueData = window.dashboardData.revenueChart;
    const bookingData = window.dashboardData.bookingChart;

    if (revenueCanvas) {

        new Chart(revenueCanvas, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Revenue",
                    data: revenueData,
                    borderColor: "#dc2626",
                    backgroundColor: "rgba(220,38,38,.15)",
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    }

    if (bookingCanvas) {

        new Chart(bookingCanvas, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Bookings",
                    data: bookingData,
                    backgroundColor: "#2563eb",
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });

    }

});