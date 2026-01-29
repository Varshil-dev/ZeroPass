import numpy as np

def pad_sequence(seq, max_len=30):
    seq = list(seq)
    if len(seq) >= max_len:
        return seq[:max_len]
    return seq + [0.0] * (max_len - len(seq))
