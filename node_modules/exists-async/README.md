# exists-async
Present a Promise-based interface for testing if something exists or not

Yes, `fs.exists` is deprecated in Node, and has an inconsistent API, but it is
very practical to use it sometimes, and so we create a consistent Promise-based
interface here.
