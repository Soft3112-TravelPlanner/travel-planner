import L from "leaflet";

// Varsayılan ikon ayarlarını sıfırlayıp CDN üzerinden çekiyoruz
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export const getAuthToken = () => {
  try {
    const profileStr = localStorage.getItem("travel-planner-profile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      return profile.token;
    }
  } catch (e) {}
  return null;
};
