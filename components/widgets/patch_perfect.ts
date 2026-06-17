import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'components/widgets/TelephonyPanel.tsx');
let code = fs.readFileSync(file, 'utf8');

const target = `Dial Manual
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}`;

const targetCRLF = `Dial Manual\r\n                                                    </button>\r\n                                                </div>\r\n                                            )}\r\n                                        </div>\r\n                                    )}\r\n                                </div>\r\n                            )}`;

if (code.includes(target)) {
    console.log("Replacing target with double close parenthesis (LF)...");
    const replacement = `Dial Manual
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}`;
    code = code.replace(target, replacement);
    fs.writeFileSync(file, code, 'utf8');
} else if (code.includes(targetCRLF)) {
    console.log("Replacing target with double close parenthesis (CRLF)...");
    const replacement = `Dial Manual\r\n                                                    </button>\r\n                                                </div>\r\n                                            )}\r\n                                        </div>\r\n                                    )}\r\n                                </div>\r\n                            )}`;
    code = code.replace(targetCRLF, replacement);
    fs.writeFileSync(file, code, 'utf8');
} else {
    console.log("Target not found directly.");
}
