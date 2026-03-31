import { useEffect, useState } from "react";
import { fetchUsers } from "../../client";
import type { UserItem } from "../../client/model/user_model";
import { useToast } from "../../context/ToastContext";
import { setLoadingScreen, stopLoadingScreen } from "../../redux/utility";
import { useAppDispatch, useAppSelector } from "../../redux/redux-hook";
import { selectUtility } from "../../redux/utility";

const UserPage = () => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const loading = useAppSelector(selectUtility).loading.screen;

  useEffect(() => {
    const load = async () => {
      try {
        dispatch(setLoadingScreen({ screen: true }));
        const res = await fetchUsers({ skip: 0, limit: 50 });
        setUsers(res.data || []);
      } catch (err: any) {
        console.error(err);
        showToast("Gagal memuat user", err?.message || "Error", "error");
      } finally {
        dispatch(stopLoadingScreen());
      }
    };
    load();
  }, [dispatch, showToast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">User Management</h1>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 card-surface">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                User ID
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-2 text-left font-medium text-gray-600">
                Level
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t">
                <td className="px-4 py-2">{u.user_id}</td>
                <td className="px-4 py-2">{u.user_name}</td>
                <td className="px-4 py-2">{u.level}</td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={3}>
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        )}
      </div>
    </div>
  );
};

export default UserPage;
