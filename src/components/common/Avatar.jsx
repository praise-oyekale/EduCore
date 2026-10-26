import { useEffect, useState } from "react";

function cleanTitle(name = "") {
  return name
    .replace(/^(Dr\.?|Mr\.?|Mrs\.?|Ms\.?|Prof\.?|Engr\.?)\s+/i, "")
    .trim();
}

function getInitials(name = "") {
  if (!name || typeof name !== "string") {
    return "U";
  }

  const cleaned = cleanTitle(name);

  if (!cleaned) return "U";

  const target = cleaned.includes("@") ? cleaned.split("@")[0] : cleaned;

  const parts = target.split(/[\s._-]+/).filter(Boolean);

  if (parts.length === 0) return "U";

  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function Avatar({
  photoURL = "",
  name = "",
  size = 92,
  className = "",
}) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoURL]);

  const showImage = Boolean(photoURL) && !imageFailed;

  return (
    <div
      className={`app-avatar ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(14, size * 0.36),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "#e0e7ff",
        color: "#1d4ed8",
        fontWeight: 700,
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {showImage ? (
        <img
          src={photoURL}
          alt={name ? `${name}'s profile` : "Profile"}
          onError={() => setImageFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
