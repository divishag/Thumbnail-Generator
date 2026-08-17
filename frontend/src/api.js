const API_BASE_URL = "/api";

export async function uploadHeadshot(file) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/upload-headshot`, {
        method: "POST",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Failed to upload headshot");
    }

    return res.json();
}

export async function createJob({ prompt, numThumbnails, headShotUrl }) {
    const res = await fetch(`${API_BASE_URL}/jobs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            prompt,
            num_thumbnails: numThumbnails,
            head_shot_url: headShotUrl,
        }),
    });

    if (!res.ok) {
        throw new Error("Failed to create job");
    }

    return res.json();
}

export async function getJob(jobId) {
    const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);

    if (!res.ok) {
        throw new Error("Failed to fetch job status");
    }

    return res.json();
}