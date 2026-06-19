import React from "react";

class ErrorBoundary extends React.Component {
constructor(props) {
super(props);

this.state = {
hasError: false
};
}

static getDerivedStateFromError() {
return {
hasError: true
};
}

componentDidCatch(error, info) {
console.log("APP ERROR:", error, info);
}

render() {
if (this.state.hasError) {
return (
<div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
<div className="bg-white rounded-3xl shadow p-10 text-center max-w-xl">
<h1 className="text-4xl font-bold text-red-600 mb-4">
Something went wrong
</h1>

<p className="text-slate-600 mb-6">
The app encountered an unexpected error. Please refresh the page.
</p>

<button
onClick={() => window.location.reload()}
className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold"
>
Refresh Page
</button>
</div>
</div>
);
}

return this.props.children;
}
}

export default ErrorBoundary;